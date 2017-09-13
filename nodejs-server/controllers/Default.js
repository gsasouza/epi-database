'use strict';

var url = require('url');


var Default = require('./DefaultService');


module.exports.epiCaNumberGET = function epiCaNumberGET (req, res, next) {
  Default.epiCaNumberGET(req.swagger.params, res, next);
};
