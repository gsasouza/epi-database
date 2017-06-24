const redis = require('redis');
const client = redis.createClient('17724', 'redis-17724.c14.us-east-1-3.ec2.cloud.redislabs.com');

module.exports = function(logger){
  client.on('error', (err)=> logger.error(err));
  return client;
}


