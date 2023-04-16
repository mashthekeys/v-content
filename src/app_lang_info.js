import {iso6393} from 'iso-639-3';
import config from "../config/config.js";

const {APP_LANG} = config;

export function getLangInfo(lang) {
  return iso6393.find(
    $ => $.iso6933 === lang || $.iso6932T === lang || $.iso6932B === lang || $.iso6931 === lang
  );
}

const APP_LANG_INFO = ['und'].concat(APP_LANG).map(
  lang => [lang, getLangInfo(lang)]
);

export default APP_LANG_INFO;