const winston = require('winston');
const Sentry = require('winston-sentry');
winston.emitErrs = true;
const sentryDsn = process.env.RAVEN_URL;

const logger = new winston.Logger({
	transports: [
		new (winston.transports.Console)({
			level: 'info',
			handleExceptions: true,
			json: false,
			colorize: true
		}),
		new Sentry({
			level: 'warn',
			dsn: sentryDsn,
			patchGlobal: true
		})
	],
	exitOnError: false;
});

module.exports = logger;