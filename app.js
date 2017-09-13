const mongoose = require('mongoose');
const express = require('express');
const schedule = require('node-schedule');
const swaggerTools = require('swagger-tools');
const fs = require('fs');
const jsyaml = require('js-yaml');
global.Promise = require('bluebird');

const port = process.env.PORT || 8080;
const mongoUrl = process.env.MONGODB_URL;
const epi = require('./components/epi');
const swaggerDoc = jsyaml.safeLoad(fs.readFileSync('./docs/doc.yaml', 'utf8'));
const app = express();

mongoose.connect(mongoUrl, {useMongoClient: true});
mongoose.Promise = global.Promise;

swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
  app.use(middleware.swaggerUi());  
  epi.model.keepUpdated();
  
  app.use('/api/epis', epi.router);

  app.listen(port, ()=>{console.log('Runing on ' + port)});

  module.exports = app;
});