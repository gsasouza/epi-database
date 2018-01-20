const mongoose = require('mongoose');
const express = require('express');
const swaggerTools = require('swagger-tools');
const fs = require('fs');
const jsyaml = require('js-yaml');
const cors = require('cors');
global.Promise = require('bluebird');

const port = process.env.PORT || 8080;
const mongoUrl = process.env.MONGODB_URL;
const epi = require('./components/epi');
const swaggerDoc = jsyaml.safeLoad(fs.readFileSync('./docs/doc.yaml', 'utf8'));
const app = express();

app.use(cors());

mongoose.connect(mongoUrl, { useMongoClient: true });
mongoose.Promise = global.Promise;

swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
  app.use(middleware.swaggerUi());  
});

app.get('/', (req, res) => res.redirect('/docs'));
app.use('/api/epis', epi.router);
epi.model.keepUpdated();
app.listen(port, () => console.log('Runing on ' + port));

module.exports = app;
