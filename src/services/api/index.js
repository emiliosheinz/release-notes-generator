const axios = require("axios");

const api = axios.create({
  headers: {
    Accept: ["application/vnd.github.inertia-preview+json"],
    Authorization: "token 05fd6de9951366cf8785c26999089d69820cef29",
  },
});

// api.interceptors.request.use(
//   function (config) {
//     // Do something before request is sent
//     console.log(config);
//     return config;
//   },
//   function (error) {
//     // Do something with request error
//     return Promise.reject(error);
//   }
// );

module.exports = api;
