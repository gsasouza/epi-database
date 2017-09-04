const redis = Promise.promisifyAll(require("redis"));

const opts = {
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_URL
}
const client =  redis.createClient(opts.port, opts.host );

module.exports = function(logger){
  client.on('error', (err)=> logger.error(err));
  return client;
}


