const logger = require('../config/logger');
const redis = require('../config/redis')(logger);
const http = require('http');
const fs = require('fs');
const unrar = require('unrar.js');
const _ = require('lodash');
const Epi = require('../models/epiModel');

const downloadFile = function(){

  const filePath = './tmp/tgg_export_caepi.rar';
  const url = 'http://www3.mte.gov.br/sistemas/CAEPI_Arquivos/tgg_export_caepi.zip' /*require('config').caepiUrl*/;

  logger.info('Donwload Iniciado');
  redis.get('lastModifiedInfo', (err, value)=>{
    if(err) return logger.error(err);
    let lastUpdated = value;
    logger.debug('Lido Valor do Redis '+ value);
    http.get(url, (res)=>{
      logger.debug('Requisição feita')
      if(lastUpdated != res.headers['last-modified']){
        let file = fs.createWriteStream(filePath);
        res.pipe(file);
        redis.set('lastModifiedInfo', res.headers['last-modified']);
        return res.on('end', ()=> {
          logger.info('Download Concluido');
          return extract(filePath);
        });
      }
      logger.info('Arquivo Atualizado, Download Cancelado');
      return;
    });
  });
};

const extract = function(filePath){
  logger.info('Iniciada Extração');     
  unrar.unrar(filePath,'./tmp', {} , (err, unpackedFiles)=>{
    if(err) return logger.error(err);
    logger.info('Extração Finalizada');
    return readFile(unpackedFiles[0].toString())
    //console.log(unpackedFiles[0]);    
  });
};

const readFile = function(filePath){
  logger.info('Leitura Iniciada');
  fs.readFile(filePath, 'binary', (err, file)=>{
    if(err) return logger.error(err);
    if(!file) return logger.warn(`Arquivo ${filePath} Vazio`);
    let epis = file.split('\r\n').map((epi)=>{
      epi = epi.split('|')
      if(epi.length === 19) return epi;
      return null;
    }).filter((epi)=>{
      return epi != null;
    }).map((epi)=>{
      return new Epi().create(epi);
    });
    eliminateDuplicatedCa(epis, (epis)=>{
      logger.info('Leitura Finizalida');
      logger.info('Update Iniciado');
      return updateDatabase(0, epis)
    });

  })
}

const eliminateDuplicatedCa = function(epis, cb){
  let epiMap = new Map();
  epis.forEach(function(epi) {
    let uniqueEpi = epiMap.get(epi.caNumber);
    if(uniqueEpi){
      uniqueEpi.norms = _.union(uniqueEpi.norms, epi.norms);
      uniqueEpi.report = _.union(uniqueEpi.report, epi.report);
      epiMap.set(uniqueEpi.caNumber, uniqueEpi);
    }else{
      epiMap.set(epi.caNumber, epi);
    }
  }, this);
  epis = []
  epiMap.forEach((value, key)=>{
    epis.push(value);
  });
  return cb(epis);
}

const updateDatabase = function(index, epis){
  let epi = epis[index];  
  if(index < epis.length && epis[index] != ''){
    Epi.findOne({caNumber: epi.caNumber}, (err, doc)=>{
      if(err) logger.error(err);
      if(doc) doc = Object.assign(doc, epi);
      else doc = epi;
      doc.save((err)=>{
        if(err) logger.error(err);
        return updateDatabase(index + 1, epis)
      }) 
    })
  }
  else{
    logger.debug('Update Finalizado') ;
    return deleteFiles();
  }
}

const deleteFiles = function () {
  fs.unlink('./tmp/tgg_export_caepi.rar', (err)=>{
    if(err) logger.error(err);
    fs.unlink('./tmp/tgg_export_caepi.txt', (err)=>{
      if(err) logger.error(err);
      logger.info('Database Atualizada')
    })
  })
}

const getEpi = function(req, res){
  Epi.findOne({caNumber: req.params.caNumber}, (err, doc)=>{
    if(err){
      logger.error(err);
      res.status(400);
      return res.send(err);
    }
    res.status(200);
    return res.send(doc);
  })
}
const doe = function(){
  console.log('foi')
}
module.exports = {
  downloadFile,
  getEpi,
  doe
}