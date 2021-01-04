import axios from "axios";

const api = axios.create({
  headers: {
    Accept: ["application/vnd.github.inertia-preview+json"],
    Authorization: "token #####",
  },
});

export default api;
