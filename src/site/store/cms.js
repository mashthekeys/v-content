import Vue from "vue";
import {deepFreeze} from "@/util/deepFreeze";
import {parseRFCDate} from "@/util/parseRFCDate.js";
import site from "../../../config/site.js";

const set = Vue.set;

const del = Vue.delete;

const pageDataSource = site.dataSource + "/page";


const cacheOptions = {
  maxAge: 30, // Do not revalidate within 30 seconds
  // noCache: false,
  // noStore: false,
  // noTransform: true,
  // mustRevalidate: false,
  // public: true,
  // private: false,
  // immutable: false,
  // staleWhileRevalidate: Infinity, // Reuse data indefinitely
  // staleIfError: Infinity, // Reuse data when server is unreachable
};


let abort = {
  signal: void 0
};

try {
  abort = new AbortController();
} catch (referenceError) {
  // ignored
}

function abortFetchRequests() {
  abort?.abort();

  try {
    abort = new AbortController();
  } catch (referenceError) {
    // ignored
  }
}

function cacheIsFresh(path, metadata) {
  // console.log("cacheIsFresh", path, metadata);
  return metadata?.expiry <= Date.now();
}

function getExpiry(date) {
  return (date ?? new Date()).getTime() + 1000 * cacheOptions.maxAge;
}

async function fetchPageData(path, includeMetadata) {
  if (!validPath(path)) return null;

  const res = await fetch(pageDataSource + path, {
    signal: abort.signal,
  });

  const data = await res.json();

  deepFreeze(data);

  if (!includeMetadata) {
    return data;
  }

  const lastModified = parseRFCDate(res.headers.get("Last-Modified"));

  const eTag = res.headers.get("ETag");

  const arrived = Date.now();

  const expires = getExpiry();

  const metadata = Object.freeze({
    lastModified,
    eTag,
    arrived,
    expires,
  });

  return {
    data,
    metadata,
  };
}

function validPath(path) {
  return typeof path === "string" && path.charAt(0) === "/";
}

const cms = {
  namespaced: true,

  state: () => ({
    activeFetch: {},
    metadata: {},
    page: {},
  }),

  mutations: {
    // ___({state, commit, dispatch}, params) {},

    _cache(state, {path, data, metadata}) {
      set(state.metadata, path, metadata);

      set(state.page, path, data);
    },

    _uncache(state, {path}) {
      del(state.metadata, path);

      del(state.page, path);
    },

    reset(state) {
      abortFetchRequests();

      for (let path in state.activeFetch) del(state.activeFetch, path);

      for (let path in state.metadata) del(state.metadata, path);

      for (let path in state.page) del(state.page, path);
    },
  },

  actions: {
    async getPageData({state, commit, dispatch}, {path, fresh, mustRevalidate, noStore, onlyIfCached}) {
      // mustRevalidate prevents use of the in-memory cache
      if (!mustRevalidate && (path in state.page)) {

        const hasFreshData = cacheIsFresh(path);

        // fresh prevents returning a stale response from the cache
        if (hasFreshData || !fresh) {
          return state.page[path];
        }
      }

      // onlyIfCached prevents requests to the server
      if (onlyIfCached) {
        return null;
      }

      let result;

      if (path in state.activeFetch) {
        result = await state.activeFetch[path];

      } else {

        const fetchPromise = fetchPageData(path, true).finally(
          () => del(state.activeFetch, path)
        );

        // noinspection ES6MissingAwait
        set(state.activeFetch, path, fetchPromise);

        result = await fetchPromise;

        // noStore prevents storing the response in the in-memory cache
        if (!noStore) {
          commit("_cache", {
            path,
            data: result.data,
            metadata: result.metadata,
          });
        }
      }

      return result.data;
    },
  },
};  // End of cms store

export default cms;