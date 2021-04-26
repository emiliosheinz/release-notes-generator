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
  milestone,
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
  })
  .option('milestone', {
    alias: 'm',
    type: 'string',
    description: 'Define a milestone to filter cards.',
  }).argv

const api = new GithubApi(token)

function sortCardsByIssueNumber(cardsInfo) {
  return cardsInfo.sort((a, b) => parseFloat(a.number) - parseFloat(b.number))
}

function byRepository(card) {
  if (repository) {
    return card.repository.toLowerCase() === repository.toLowerCase()
  }

  return true
}

function byLabel(card) {
  if (label) {
    return card.labels.some(e => e.name.toLowerCase() === label.toLowerCase())
  }

  return true
}

function byMilestone(card) {
  if (milestone) {
    return card.milestone === milestone
  }

  return true
}

function filterCards(cards) {
  return cards.filter(byRepository).filter(byLabel).filter(byMilestone)
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

function cardFactory(object) {
  if (!object) {
    return null
  }

  return {
    number: object.number,
    title: object.title,
    labels: object.labels,
    milestone: object.milestone?.title || '',
  }
}

function getCardsInfo(cards) {
  return Promise.all(
    cards.map(async card => {
      const cardInfo = await api.getCardInfo(card.content_url)
      const { name: repoName } = await api.getCardRepositoryInfo(
        cardInfo.repository_url
      )

      return {
        ...cardFactory(cardInfo),
        repository: repoName,
      }
    })
  )
}

async function loadReleaseNotes() {
  const orgProjects = await api.getOrganizationProjects(organizationName)
  const filteredProject = orgProjects?.find(p => p.number === projectNumber)
  const columns = await api.getProjectColumns(filteredProject?.id)

  const filteredColumn = columns?.find(col => col.name === column)

  if (filteredColumn) {
    const { cards_url: cardsUrl } = filteredColumn
    const columnCards = await api.getColumnCards(cardsUrl)
    const cards = await getCardsInfo(columnCards)

    renderCards(cards)
  }
}

loadReleaseNotes()
