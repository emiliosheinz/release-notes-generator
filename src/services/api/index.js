const axios = require("axios");

const api = axios.create({
  headers: {
    Accept: ["application/vnd.github.inertia-preview+json"],
    Authorization: "token d39a6b0c41d5d4288e1087115ccc2f81cf6987cb",
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
