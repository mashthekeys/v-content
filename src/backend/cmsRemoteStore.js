import config from "../../config/config.js";

const {STORE_URL} = config;

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
};

export const cmsRemoteStore = {
  async getById(table, id) {
    const res = await fetch(`${STORE_URL}/id` , {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({table, id}),
    });

    if (+res.status === 200) {
      return await res.json();
    }

    return undefined;
  },

  async deleteById(table, id) {
    const res = await fetch(`${STORE_URL}/delete` , {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({table, id}),
    });

    // HTTP 204 No Content
    return +res.status === 204;
  },

  async deleteAll(table, query) {
    const res = await fetch(`${STORE_URL}/deleteAll` , {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({table, query}),
    });

    // HTTP 204 No Content
    return +res.status === 204;
  },

  async find(table, query) {
    const res = await fetch(`${STORE_URL}/query` , {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({table, query}),
    });

    if (+res.status === 200) {
      return await res.json();
    }

    return undefined;
  },

  async findAll(table, query) {
    const res = await fetch(`${STORE_URL}/queryAll` , {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({table, query}),
    });

    if (+res.status === 200) {
      return await res.json();
    }

    return undefined;
  },

  async store(table, {data, id}, command) {
    const res = await fetch(`${STORE_URL}/store` , {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify({table, id, data, command}),
    });

    if (+res.status === 200) {
      return await res.json();
    }

    return undefined;
  },
};
