const api = require("./services/api");

api
  .get("https://api.github.com/projects/4070332/columns")
  .then((resp) => {
    // Get Done column
    const doneColumn = resp.data.find((column) => column.name === "DONE");

    // Get done column cards
    api.get(doneColumn.cards_url + "?per_page=100").then((resp) => {
      // Get cards content (should be a loop)
      resp.data.forEach((card) => {
        api.get(card.content_url).then((resp) => {
          console.log("#" + resp.data.number + " " + resp.data.title);
        });
      });
    });
  })
  .catch((error) => {
    console.log(error);
  });
