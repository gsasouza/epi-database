const mongoose = require('mongoose');
const express = require('express');
const schedule = require('node-schedule');

const port = process.env.PORT || 8080;

const app = express();

mongoose.connect('mongodb://gabriel:gabriel123@ds135382.mlab.com:35382/acrux-epi-database', {useMongoClient: true});

mongoose.Promise = global.Promise;

const epiController = require('./controllers/epiController');
const epiRouter = require('./routes/epiRouter')(epiController);

const rule = new schedule.RecurrenceRule();
rule.hour = 18;
rule.minute = 18;
schedule.scheduleJob(rule, epiController.downloadFile)

app.use('/api', epiRouter);
app.get('/', (req, res)=>{
  res.sendFile(__dirname+'/views/index.html')
})

app.listen(port, ()=>{console.log('Runing on ' + port)});
