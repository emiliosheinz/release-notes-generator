#!/usr/bin/env node
const yargs = require('yargs')
const { hideBin } = require('yargs/helpers')
const cardFactory = require('./factories')
const GithubApi = require('./services/api/index.js')
const { filters } = require('./utils')

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

function filterCards(cards) {
  return cards
    ?.filter(card => filters.byRepository(card, repository))
    .filter(card => filters.byLabel(card, label))
    .filter(card => filters.byMilestone(card, milestone))
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
