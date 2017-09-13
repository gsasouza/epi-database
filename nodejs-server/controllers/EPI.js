'use strict';

var url = require('url');


var EPI = require('./EPIService');


module.exports.epiCaNumberGET = function epiCaNumberGET (req, res, next) {
  EPI.epiCaNumberGET(req.swagger.params, res, next);
};
