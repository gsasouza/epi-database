var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var epiModel = new Schema({
  caNumber: {
    type: Number
  },
  shelfLife: {
    type: String
  },
  situation: {
    type: String
  },
  processNumber: {
    type: Number
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
  manufacturer:{
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
  report:[{
    reportNumber: {
      type: String
    },
    laboratoryName:{
      type: String
    },
    laboratoryCnpj:{
      type: Number
    }
  }],
  // Normas
  norms:[{
    type: String
  }],
  observations: {
    type: String
  }
});

epiModel.methods.create = function(element){
  this.caNumber = element[0];
  this.shelfLife = element[1];
  this.situation = element[2];
  this.processNumber= element[3];
  this.manufacturer = {
    cnpj :element[4],
    companyName : element[5]
  };
  this.nature = element[6];
  this.equipamentName = element[7];
  this.description = element[8];
  this.caMarcation = element[9];
  this.references = element[10];
  this.color = element[11];
  this.aprovedFor = element[12];
  this.restrictions = element[13];
  this.observations = element[14];
  this.report = [{
    laboratoryCnpj: element[15],
    laboratoryName : element[16],
    reportNumber : element[17]
  }],
  this.norms = [element[18]];
  return this
}

module.exports = mongoose.model('Epi', epiModel); 