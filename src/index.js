import api from "./services/api/index.js";
import prompt from "prompt";
import colors from "colors";

global.option = undefined;

const HOMOLOG_NOK = `HOMOLOG NOK`;

async function loadReleaseNotes() {
  const { data: columns } = await api.get(
    "https://api.github.com/projects/4070332/columns"
  );

  const { cards_url } = columns.find((column) => column.name === `DONE`);

  const { data: cards } = await api.get(`${cards_url}?per_page=100`);
  getCardsInfo(cards);
}

function renderCard({ number, title }) {
  console.log(`#${number} ${title}`);
}

function getCardsInfo(cards) {
  cards.forEach(async (card) => {
    const { data } = await api.get(card.content_url);
    const labels = data.labels.some((e) => e.name === global.option);
    if (!global.option) {
      renderCard({ number: data.number, title: data.title });
      return;
    }

    if (labels) {
      renderCard({ number: data.number, title: data.title });
      return;
    }
  });
}

(() => {
  prompt.start();

  prompt.message = colors.bold("Filtrar por alguma label especifica ? \n");

  prompt.get(
    {
      properties: {
        option: {
          description: colors.cyan("Label: "),
        },
      },
    },
    (err, result) => {
      global.option = result.option;

      loadReleaseNotes();
    }
  );
})();
