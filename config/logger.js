const winston = require('winston');
require('winston-daily-rotate-file');
const fs = require('fs');
const tsFormat = () => (new Date()).toLocaleTimeString();

function createDailyTransporter(level){
	return new (winston.transports.DailyRotateFile)(
	{	
		name: 'daily-' + level,	
		filename: `./logs/${level}/log`,
		dataPattern: 'dd-MM-yy',
		prepend: true,
		timestamp: tsFormat,
		level: level	
	});
};

function createConsoleTransporter(level){
	return new (winston.transports.Console)(
	{
		timestamp: tsFormat,
		name: 'console-' + level, 
		level: level, 
		colorize: true
	})
};

const debug = new (winston.Logger)({
	levels: {
		debug: 0
	},
	colors: {
		debug: 'green'
	},
	transports:[
		createConsoleTransporter('debug')
	]
});

const info = new(winston.Logger)({
	levels: {
		info: 1
	},
	colors: {
		info: 'cyan'
	},
	transports: [
		createConsoleTransporter('info'),
		createDailyTransporter('info')
	]
});

const warn = new (winston.Logger)({
	levels: {
		warn: 2
	},
	colors: {
		warn: 'yellow'
	},
	transports:[
		createConsoleTransporter('warn'),
		createDailyTransporter('warn')
	]
});

const error = new (winston.Logger)({
	levels: {
		error: 3
	},
	colors: {
		error: 'red'
	},
	transports: [
		createConsoleTransporter('error'),
		createDailyTransporter('error')
	]
});

winston.add(winston.transports.DailyRotateFile, {	
	exitOnError: false,	
	handleExceptions: true,
	humanReadableUnhandledException: true,
	name: 'daily-exception',	
	filename: `./logs/error/log`,
	dataPattern: 'dd-MM-yy',
	prepend: true,
	timestamp: tsFormat,
	level: 'error'	
});
winston.add(winston.transports.Console, {	
	exitOnError: false,	
	handleExceptions: true,
	humanReadableUnhandledException: true,
	name: 'console-exception',	
	timestamp: tsFormat,
	level: 'error'	
});

const logger = {
	debug: (msg)=> debug.debug(msg),
	info: (msg)=> info.info(msg),
	warn: (msg)=> warn.warn(msg),
	error: (msg)=> error.error(msg),
	log: (level, msg)=> logger[level](msg)
};

module.exports = logger;