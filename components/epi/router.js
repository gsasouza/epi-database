const epiController = require('./epi');
const Router = require('express').Router();

module.exports = function epiRouter() {  
  Router
    .route('/:caNumber')
    .get(epiController.getEpi);

  return Router;
}

