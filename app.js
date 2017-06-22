const mongoose = require('mongoose');
const express = require('express');
const schedule = require('node-schedule');

const port = process.env.PORT || 8080;

const app = express();

//mongoose.connect('mongodb://localhost:27017');
//mongoose.Promise = global.Promise;

const epiController = require('./controllers/epiController');
const epiRouter = require('./routes/epiRouter')(epiController);

const rule = new schedule.RecurrenceRule();
rule.hour = 16;
rule.minute = 26;
schedule.scheduleJob(rule, epiController.downloadFile)

app.use('/api', epiRouter);
app.get('/', (req, res)=>{
  res.send('COÉ RAPAZIADAAAA!');
})

app.listen(port, ()=>{console.log('Runing on ' + port)});
