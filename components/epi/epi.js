const mongoose = Promise.promisifyAll(require('mongoose'));
const axios = require('axios');
const logger = require('../../config/logger');
const redis = require('../../config/redis')(logger);
const fs = Promise.promisifyAll(require('fs'));
const unrar = require('unrar.js');
const _ = require('lodash');
const schedule = require('node-schedule');

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
      type: Number
      //required: true
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

epiSchema.methods.create = function (epi) {
  epi = epi.split('|');
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
  ],
  this.norms = [epi[18]];
  return this
}

const Epi = mongoose.model('Epi', epiSchema);


const downloadFile = function () {
  const filePath = './tmp/tgg_export_caepi.rar';
  const url = 'http://www3.mte.gov.br/sistemas/CAEPI_Arquivos/tgg_export_caepi.zip';

  logger.info('Donwload Iniciado');
  let lastModifiedInfo = '';
  redis.getAsync('lastModifiedInfo')
    .then((value)=>{
      lastModifiedInfo = value;
      return axios.get(url, {responseType: 'arraybuffer'})
    })
    .then((response) =>{
      if (lastModifiedInfo != response.headers['last-modified']) {
        redis.set('lastModifiedInfo', response.headers['last-modified']);
        return fs.writeFileAsync(filePath, response.data);
      }
      return;      
    })
    .then(()=> extract(filePath))
    .catch((err) => logger.error(err))
};

const extract = function (filePath) {
  logger.info('Iniciada Extração');
  unrar.unrar(filePath, './tmp', {}, (err, unpackedFiles) => {
    if (err) return logger.error(err);
    logger.info('Extração Finalizada');
    return readFile(unpackedFiles[0].toString());
  });
};

const readFile = function (filePath) {
  logger.info('Leitura Iniciada');
  
  fs.readFileAsync(filePath, 'binary')
    .then((file)=>{
      if (!file) return logger.warn(`Arquivo ${filePath} Vazio`);
      const epis = file.split('\r\n')
        .filter((epi) => epi.split('|').length === 19)
        .map(epi => new Epi().create(epi));
      return eliminateDuplicatedCa(epis);
    })
    .then((epis)=> {
      updateDatabase(0, epis);
    })
}

const eliminateDuplicatedCa = function (epis) {
  return new Promise((resolve, reject)=>{
    const epiMap = new Map();
    epis.map((epi)=>{
      const uniqueEpi = epiMap.get(epi.caNumber);
      if (uniqueEpi) {
        uniqueEpi.norms = _.union(uniqueEpi.norms, epi.norms);
        uniqueEpi.report = _.union(uniqueEpi.report, epi.report);
        return epiMap.set(uniqueEpi.caNumber, uniqueEpi);
      }
      else return epiMap.set(epi.caNumber, epi);
    });
    resolve(Array.from(epis)); 
  })
  
  /*
  let epiMap = new Map();
  epis.forEach(function (epi) {
    let uniqueEpi = epiMap.get(epi.caNumber);
    if (uniqueEpi) {
      uniqueEpi.norms = _.union(uniqueEpi.norms, epi.norms);
      uniqueEpi.report = _.union(uniqueEpi.report, epi.report);
      epiMap.set(uniqueEpi.caNumber, uniqueEpi);
    } else {
      epiMap.set(epi.caNumber, epi);
    }
  }, this);
  epis = [];
  epiMap.forEach((value, key) => {
    epis.push(value);
  });
  return cb(epis);
  */
}

const updateDatabase = function (index, epis) {
  let epi = epis[index];
  if (index < epis.length && epis[index] != '') {
    return Epi.findOne({ caNumber: epi.caNumber}, (err, doc) => {
      if (err) logger.error(err);
      Object.assign(doc, epi).save(
        (err) => {
        if (err) return logger.error(err);
        return updateDatabase(index++, epis)
      })
    })
  }
  logger.debug('Update Finalizado');
  return deleteFiles();
}

const deleteFiles = function () {
  fs.unlinkAsync('./tmp/tgg_export_caepi.rar')
    .then(()=> fs.unlink('./tmp/tgg_export_caepi.txt'))
    .then(()=> logger.info('Database Atualizada'))
    .catch((err)=> logger.error(err))
}

const keepUpdated = function(){
  const rule = new schedule.RecurrenceRule();
  rule.hour = 18
  rule.minute = 31
  return schedule.scheduleJob(rule, ()=> console.log('here'))// epiController.downloadFile)
}

const getEpi = function (req, res) {
  Epi.findOne({ caNumber: req.params.caNumber })
    .then((doc)=> {
      if(!doc) return res.status(404).send({ status: 404, message: 'EPI Not Found' });
      return res.status(200).send({status: 200, message: 'EPI found successfully', data: doc}); 
    })
    .catch((err) => res.send({status: 400, message: err}))
}

module.exports = {
  keepUpdated, 
  getEpi
}