/**
 * Configurations of logger.
 */
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const consoleConfig = [
  new winston.transports.Console({
    'colorize': true
  })
];

const transport = new DailyRotateFile({
  filename: './logger/error.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '7d',
  prepend: true,
  level: 'info',
  depth: true,
  prettyPrint: true,
});

const errorLogger = winston.createLogger({
  levels: winston.config.syslog.levels,
  transports: [
    transport,
    new winston.transports.Console({ level: 'error' }),

  ]
});
module.exports = {
  'logs': errorLogger
};