global.Promise = require('bluebird');
const env = process.env.NODE_ENV;
const mongoose = Promise.promisifyAll(require('mongoose'));
const axios = require('axios');
const logger = require('../../config/logger');
const redis = require('../../config/redis')(logger);
const fs = Promise.promisifyAll(require('fs'));
const unrar = require('../../utils/unrar.js');
const _ = require('lodash');
const schedule = require('node-schedule');
const async = require('promise-async');

const epiSchema = new mongoose.Schema({
  caNumber: {
    type: String
  },
  shelfLife: {
    type: String
  },
  situation: {
    type: String
  },
  processNumber: {
    type: String
  },
  equipamentName: {
    type: String
  },
  description: {
    type: String
  },
  nature: {
    type: String
  },
  // Fabricante
  manufacturer: {
    cnpj: {
      type: String
    },
    companyName: {
      type: String
    }
  },
  // Dados Complementares
  color: {
    type: String
  },
  caMarcation: {
    type: String
  },
  references: {
    type: String
  },
  aprovedFor: {
    type: String
  },
  restrictions: {
    type: String
  },
  // Laudos
  report: [
    {
      reportNumber: {
        type: String
      },
      laboratoryName: {
        type: String
      },
      laboratoryCnpj: {
        type: String
      }
    }
  ],
  // Normas
  norms: [
    {
      type: String
    }
  ],
  observations: {
    type: String
  }
});

epiSchema.methods.create = function (data) {
  const epi = data.split('|');
  this.caNumber = epi[0];
  this.shelfLife = epi[1];
  this.situation = epi[2];
  this.processNumber = epi[3];
  this.manufacturer = {
    cnpj: epi[4],
    companyName: epi[5]
  };
  this.nature = epi[6];
  this.equipamentName = epi[7];
  this.description = epi[8];
  this.caMarcation = epi[9];
  this.references = epi[10];
  this.color = epi[11];
  this.aprovedFor = epi[12];
  this.restrictions = epi[13];
  this.observations = epi[14];
  this.report = [
    {
      laboratoryCnpj: epi[15],
      laboratoryName: epi[16],
      reportNumber: epi[17]
    }
  ];
  this.norms = [epi[18]];
  return this;
};

const Epi = mongoose.model('Epi', epiSchema);

const downloadFile = function (filePath) {
  const url = 'http://www3.mte.gov.br/sistemas/CAEPI_Arquivos/tgg_export_caepi.zip';
  logger.log('info', 'Donwload Iniciado');
  let lastModifiedInfo = '';
  return redis.getAsync('lastModifiedInfo')
    .then((value)=>{
      lastModifiedInfo = value;
      return axios.get(url, { responseType: 'arraybuffer' });
    })
    .then((response) =>{
      if (lastModifiedInfo !== response.headers['last-modified']) {
        redis.set('lastModifiedInfo', response.headers['last-modified']);
        return fs.writeFileAsync(filePath, response.data);
      }
      if (env === 'test') return fs.writeFileAsync(filePath, response.data);
      return null;
    });
};

const extract = function (filePath) {
  logger.log('info', 'Iniciada Extração');
  return new Promise((resolve, reject)=> {
    unrar.unrar(filePath, './tmp', {}, (err, unpackedFiles) => {
      if (err) return reject(err);
      logger.log('info', 'Extração Finalizada');
      return resolve(unpackedFiles[0].toString());
    });
  });
};

const eliminateDuplicatedCa = function (epis) {
  return new Promise((resolve) => {
    const epiMap = new Map();
    epis.map((epi) => {
      const uniqueEpi = epiMap.get(epi.caNumber);
      if (uniqueEpi) {
        uniqueEpi.norms = _.union(uniqueEpi.norms, epi.norms);
        uniqueEpi.report = _.union(uniqueEpi.report, epi.report);
        return epiMap.set(uniqueEpi.caNumber, uniqueEpi);
      }
      return epiMap.set(epi.caNumber, epi);
    });
    return resolve(Array.from(epis));
  });
};

const readFile = function (filePath) {
  logger.log('info', 'Leitura Iniciada');
  return fs.readFileAsync(filePath, 'binary')
    .then((file)=> {
      if (!file) return;
      const epis = file.split('\r\n')
        .filter((epi) => epi.split('|').length === 19)
        .map(epi => new Epi().create(epi));
      return eliminateDuplicatedCa(epis);
    });
};

const updateDatabase = function (epis) {
  return async.eachSeries(epis, function (epi, cb) {
    Epi.findOne({ caNumber: epi.caNumber })
      .then((doc)=>{
        return Object.assign(doc, epi).saveAsync();
      })
      .then(()=> cb())
      .catch((err) => {
        logger.log(err);
        return cb();
      });
  });
};

const deleteFiles = function () {
  return fs.unlinkAsync('./tmp/tgg_export_caepi.rar')
    .then(()=> fs.unlinkAsync('./tmp/tgg_export_caepi.txt'));
};

const update = function () {
  const filePath = './tmp/tgg_export_caepi.rar';
  downloadFile(filePath)
    .then(()=> extract(filePath))
    .then((fileName)=> readFile(fileName))
    .then((epis) => updateDatabase(epis))
    .then(()=> deleteFiles())
    .then(()=> logger.log('info', 'Database atualizada'))
    .catch((err)=> logger.log('error', err));
};

const keepUpdated = function () {
  const rule = new schedule.RecurrenceRule();
  rule.hour = 18;
  rule.minute = 31;
  return schedule.scheduleJob(rule, ()=> update());
};

const getEpi = function (req, res) {
  Epi.findOne({ caNumber: req.params.caNumber })
    .then((doc)=> {
      if (!doc) return res.status(404).send({ status: 404, message: 'EPI Not Found' });
      return res.status(200).send({ status: 200, message: 'EPI found successfully', data: doc });
    })
    .catch((err) => res.send({ status: 500, message: 'Unexpected Server', description: err }));
};

module.exports = env === 'test'
  ?
  {
    downloadFile,
    extract,
    readFile,
    eliminateDuplicatedCa,
    updateDatabase,
    deleteFiles,
    keepUpdated,
    getEpi
  }
  :
  {
    keepUpdated,
    getEpi
  };
