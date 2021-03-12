#!/usr/bin/env node
const yargs = require('yargs')
const { hideBin } = require('yargs/helpers')
const api = require('./services/api/index.js')

const {
  organizationName,
  projectNumber,
  token,
  label,
  column,
  isSorted,
  repository,
} = yargs(hideBin(process.argv))
  .option('organizationName', {
    alias: 'o',
    type: 'string',
    description: 'The name of the organization in which the project is stored.',
    demandOption: 'Please provide a valid organizationName.',
  })
  .option('projectNumber', {
    alias: 'p',
    type: 'number',
    description: 'You can find the project number in the URL on Github',
    demandOption: 'Please provide a valid projectNumber.',
  })
  .option('token', {
    alias: 't',
    type: 'string',
    description: 'A personal GitHub token with access to the project.',
    demandOption: 'Please provide a valid Github personal token.',
  })
  .option('label', {
    alias: 'l',
    type: 'string',
    description: 'Define label to filter cards',
  })
  .option('isSorted', {
    alias: 's',
    type: 'boolean',
    description: 'Sort by issue number.',
  })
  .option('column', {
    alias: 'c',
    type: 'string',
    description: 'Column name from where cards will be taken.',
    demandOption: 'Please provide a valid Github project Column.',
  })
  .option('repository', {
    alias: 'r',
    type: 'string',
    description: 'Filter cards by the associated repository.',
  }).argv

const runtimeHeaders = {
  Authorization: `token ${token}`,
}

function sortCardsByIssueNumber(cardsInfo) {
  return cardsInfo.sort((a, b) => {
    if (a.number > b.number) {
      return 1
    }
    if (a.number < b.number) {
      return -1
    }
    return 0
  })
}

function filterCards(cards) {
  return cards.filter(card => {
    let preserveCard = true
    if (repository) {
      preserveCard = card.repository.toLowerCase() === repository.toLowerCase()
    }
    if (label) {
      preserveCard = card.labels.some(
        e => e.name.toLowerCase() === label.toLowerCase()
      )
    }
    return preserveCard
  })
}

function renderCard({ number, title }) {
  console.log(`#${number} ${title}`)
}

function renderCards(cardsInfo) {
  let cards = filterCards(cardsInfo)

  if (isSorted) {
    cards = sortCardsByIssueNumber(cards)
  }

  cards.forEach(card => {
    renderCard(card)
  })
}

function getCardsInfo(cards) {
  return Promise.all(
    cards.map(async card => {
      const { data: cardInfo } = await api.get(card.content_url, {
        headers: runtimeHeaders,
      })

      const {
        data: { name: repoName },
      } = await api.get(cardInfo.repository_url, {
        headers: runtimeHeaders,
      })
      return {
        number: cardInfo.number,
        title: cardInfo.title,
        labels: cardInfo.labels,
        repository: repoName,
      }
    })
  )
}

async function loadReleaseNotes() {
  const { data: orgProjects } = await api.get(
    `https://api.github.com/orgs/${organizationName}/projects`,
    {
      headers: runtimeHeaders,
    }
  )
  if (!orgProjects) {
    return
  }

  const filteredProject = orgProjects.find(p => p.number === projectNumber)
  if (!filteredProject) {
    return
  }

  const { data: columns } = await api.get(
    `https://api.github.com/projects/${filteredProject.id}/columns`,
    {
      headers: runtimeHeaders,
    }
  )
  if (!columns) {
    return
  }

  const filteredColumn = columns.find(col => col.name === column)
  if (!filteredColumn) {
    return
  }

  const { cards_url: cardsUrl } = filteredColumn
  const { data: cards } = await api.get(`${cardsUrl}?per_page=100`, {
    headers: runtimeHeaders,
  })

  getCardsInfo(cards).then(cardsInfo => {
    renderCards(cardsInfo)
  })
}

loadReleaseNotes()
