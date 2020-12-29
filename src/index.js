import api from "./services/api/index.js";
import prompt from "prompt";
import colors from "colors";

global.option = undefined;

const HOMOLOG_NOK = `HOMOLOG NOK`;
const OPTIONS = {
  ALL: 1,
  HOMOLOG_NOK: 2,
};

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
    const labels = data.labels.find((e) => e.name === HOMOLOG_NOK);

    if (global.option === OPTIONS.ALL) {
      renderCard({ number: data.number, title: data.title });
      return;
    }

    if (labels) {
      renderCard({ number: data.number, title: data.title });
    }
  });
}

(() => {
  prompt.start();

  prompt.message = colors.bold(
    "Selecione (1) para todos cards e (2) para apenas HOMOLOG NOK! \n\n"
  );

  prompt.get(
    {
      properties: {
        option: {
          description: colors.cyan("Opcao: "),
        },
      },
    },
    (err, result) => {
      global.option = result.option;

      loadReleaseNotes();
    }
  );
})();
