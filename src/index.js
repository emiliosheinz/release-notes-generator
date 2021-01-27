#!/usr/bin/env node
const api = require("./services/api/index.js");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const { label, column, projectId, token } = yargs(hideBin(process.argv))
  .option("label", {
    alias: "l",
    type: "string",
    description: "Define label to filter cards",
  })
  .option("column", {
    alias: "c",
    type: "string",
    description: "Column name from where cards will be taken.",
  })
  .option("projectId", {
    alias: "p",
    type: "string",
    description: "Project ID in which you have the data stored in.",
    demandOption: "Please provide a valid projectId.",
  })
  .option("token", {
    alias: "t",
    type: "string",
    description: "A personal GitHub token with access to the project.",
    demandOption: "Please provide a valid Github personal token.",
  }).argv;

const runtimeHeaders = {
  Authorization: `token ${token}`,
};

function renderCard({ number, title }) {
  console.log(`#${number} - ${title}`);
}

function getCardsInfo(cards) {
  cards.forEach(async (card, i) => {
    const { data: cardInfo } = await api.get(card.content_url, {
      headers: runtimeHeaders,
    });

    if (!label) {
      renderCard({ number: cardInfo.number, title: cardInfo.title });
      return;
    }

    const hasLabel = cardInfo.labels.some(
      (e) => e.name.toLowerCase() === label.toLowerCase()
    );

    if (hasLabel) {
      renderCard({ number: cardInfo.number, title: cardInfo.title });
      return;
    }
  });
}

async function loadReleaseNotes() {
  const { data: columns } = await api.get(
    `https://api.github.com/projects/${projectId}/columns`,
    {
      headers: runtimeHeaders,
    }
  );

  const filteredColumn = columns.find((col) => col.name === column);

  const { cards_url } = column ? filteredColumn : columns[0];

  const { data: cards } = await api.get(`${cards_url}?per_page=100`, {
    headers: runtimeHeaders,
  });

  getCardsInfo(cards);
}

loadReleaseNotes();
