const mongoose = require('mongoose');
const express = require('express');
const schedule = require('node-schedule');
global.Promise = require('bluebird');

const port = process.env.PORT || 8080;
const mongoUrl = process.env.MONGODB_URL;
const epi = require('./components/epi');

const app = express();
epi.model.keepUpdated();

mongoose.connect(mongoUrl, {useMongoClient: true});
mongoose.Promise = global.Promise;

app.use('/api/epis', epi.router);

app.get('/', (req, res)=>{
  res.sendFile(__dirname + '/views/index.html')
});

app.listen(port, ()=>{console.log('Runing on ' + port)});

module.exports = app;