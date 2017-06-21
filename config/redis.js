const redis = require('redis');
const client = redis.createClient();

module.exports = function(logger){
  client.on('error', (err)=> logger.error(err));
  return client;
}


