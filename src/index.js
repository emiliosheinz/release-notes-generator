#!/usr/bin/env node
const yargs = require('yargs')
const { hideBin } = require('yargs/helpers')
const GithubApi = require('./services/api/index.js')

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

const api = new GithubApi(token)

function sortCardsByIssueNumber(cardsInfo) {
  return cardsInfo.sort((a, b) => parseFloat(a.number) - parseFloat(b.number))
}

function filterByRepository(card) {
  if (repository) {
    return card.repository.toLowerCase() === repository.toLowerCase()
  }

  return true
}

function filterByLabel(card) {
  if (label) {
    return card.labels.some(e => e.name.toLowerCase() === label.toLowerCase())
  }

  return true
}

function filterCards(cards) {
  return cards.filter(filterByRepository).filter(filterByLabel)
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
      const cardInfo = await api.getCardInfo(card.content_url)
      const { name: repoName } = await api.getCardRepositoryInfo(
        cardInfo.repository_url
      )

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
  const orgProjects = await api.getOrganizationProjects(organizationName)
  if (orgProjects) {
    const filteredProject = orgProjects.find(p => p.number === projectNumber)
    if (filteredProject) {
      const columns = await api.getProjectColumns(filteredProject.id)
      if (columns) {
        const filteredColumn = columns.find(col => col.name === column)
        if (filteredColumn) {
          const { cards_url: cardsUrl } = filteredColumn
          const cards = await api.getColumnCards(cardsUrl)
          const cardsInfo = await getCardsInfo(cards)
          renderCards(cardsInfo)
        }
      }
    }
  }
}

loadReleaseNotes()
