const axios = require('axios')

const GITHUB_API_URL = 'https://api.github.com/'

const api = axios.create({
  headers: {
    Accept: [
      'application/vnd.github.inertia-preview+json',
      'application/vnd.github.v3+json',
    ],
  },
})
class GithubApi {
  constructor(token) {
    this.token = token
  }

  async _getUri(uri = '') {
    const response = await api.get(`${GITHUB_API_URL}${uri}`, {
      headers: {
        Authorization: `token ${this.token}`,
      },
    })
    return response
  }

  async _getUrl(url = '') {
    const response = await api.get(`${url}`, {
      headers: {
        Authorization: `token ${this.token}`,
      },
    })
    return response
  }

  async getOrganizationProjects(organizationName = '') {
    const { data: organizationProjects } = await this._getUri(
      `orgs/${organizationName}/projects`
    )
    return organizationProjects
  }

  async getProjectColumns(projectId = '') {
    const { data: projectColumns } = await this._getUri(
      `projects/${projectId}/columns`
    )
    return projectColumns
  }

  async getColumnCards(columnCardsUlr = '', perPage = 100) {
    const { data: columnCards } = await this._getUrl(
      `${columnCardsUlr}?per_page=${perPage}`
    )
    return columnCards
  }

  async getCardInfo(cardInfoUrl = '') {
    const { data: cardInfo } = await this._getUrl(cardInfoUrl)
    return cardInfo
  }

  async getCardRepositoryInfo(cardRepositoryInfoUrl = '') {
    const { data: cardRepositoryInfo } = await this._getUrl(
      cardRepositoryInfoUrl
    )
    return cardRepositoryInfo
  }
}

module.exports = GithubApi
