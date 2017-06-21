const epiRouter = function(epiController){
  const Router = require('express').Router();
  Router.route('/:caNumber')
    .get(epiController.getEpi);
  
  return Router;
}

module.exports = epiRouter