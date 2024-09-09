const db = require("../models");
// const model = db.model;

exampleMiddlewareFunction = (req, res, next) => {
  // do something
  next()
};

const verify = {
  exampleMiddlewareFunction: exampleMiddlewareFunction,
};

module.exports = verify;
