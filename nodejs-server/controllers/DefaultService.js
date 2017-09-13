'use strict';

exports.epiCaNumberGET = function(args, res, next) {
  /**
   * parameters expected in the args:
  * caNumber (String)
  **/
    var examples = {};
  examples['application/json'] = {
  "data" : {
    "color" : "PRETO",
    "references" : "DA-14500",
    "nature" : "Importado",
    "processNumber" : "46017012653201203",
    "caNumber" : "9722",
    "description" : "Óculos de segurança constituído de um arco de material plástico preto, com um pino central e uma fenda em cada extremidade...",
    "restrictions" : "",
    "equipamentName" : "ÓCULOS",
    "manufacturer" : {
      "companyName" : "DVS EQUIPAMENTOS DE PROTECAO INDIVIDUAL LTDA",
      "cnpj" : "58533209000109"
    },
    "norms" : [ "ANSI.Z.87.1/2003" ],
    "aprovedFor" : "PROTEÇÃO DOS OLHOS DO USUÁRIO CONTRA IMPACTOS DE PARTÍCULAS VOLANTES MULTIDIRECIONAIS E CONTRA LUMINOSIDADE INTENSA NO CASO DOS VISORES CINZA E VERDE.",
    "observations" : "A transmitância luminosa do visores cinza e verde indica que eles seriam de tonalidade 3.0 e 2.5...",
    "report" : [ {
      "reportNumber" : "305/2012-A",
      "laboratoryName" : "FUNDACENTRO - FUNDAÇÃO JORGE DUPRAT FIGUEIREDO DE SEG E MED DO TRABALHO",
      "laboratoryCnpj" : "62428073000136"
    } ],
    "shelfLife" : "26/11/2017",
    "caMarcation" : "Na haste",
    "situation" : "VÁLIDO"
  },
  "message" : "EPI found successfully",
  "status" : "200"
};
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}

