const winston = require('winston');
const Sentry = require('winston-sentry');
winston.emitErrs = true;
const sentryDsn = process.env.RAVEN_URL;
const env = process.env.NODE_ENV;

const logger = new winston.Logger({
	transports: [
		new (winston.transports.Console)({
			level: 'info',
			handleExceptions: env === 'test' ? false: true,
			json: false,
			colorize: true
		}),
		new Sentry({
			level: 'warn',
			dsn: sentryDsn,
			patchGlobal:  env === 'test' ? false : true
		})
	],
	exitOnError: false
});

module.exports = env === 'test' ? { log: ()=>{} } : '';