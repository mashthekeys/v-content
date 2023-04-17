import http from "http";

export function debugUrlMiddleware(req, res, next) {
  (res.console || console).warn(req.url);
  next();
}

export function debugBodyMiddleware(req, res, next) {
  (res.console || console).warn(req.url);
  (res.console || console).warn(req.body);
  next();
}

export function customErrorMiddleware({debug}) {
  return function $customErrorMiddleware(req, res, next) {
    let {customError} = req;

    if (customError === true) {
      customError = {status: 500};

    } else if (typeof customError === "number") {
      customError = {status: customError};

    } else if (typeof customError === "string") {
      customError = {status: 500, internalMessage: customError};
    }

    if (typeof customError !== "object" || customError === null) {
      return next();
    }

    let {status, fast} = customError;

    status = (status | 0) || 500;

    if (fast) {
      // TODO consider adding a delay to queries which skipped the database
    }

    if (debug) {
      console.warn('customError', customError);
    }

    res.status(status).send(http.STATUS_CODES[status]);
  };
}