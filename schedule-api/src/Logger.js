const { createLogger, format, transports, config } = require("winston");
require("winston-daily-rotate-file");
const winston = require("winston");

var transport = new winston.transports.DailyRotateFile({
  filename: "./logs/qe-admin-be-%DATE%.log",
  datePattern: "yyyy-MM-DD",
  prepend: true,
  level: "info",
  format: format.combine(
    format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
    format.align(),
    format.printf(
      (info) => `${info.level}: ${[info.timestamp]}: ${info.message}`
    )
  ),
});

const usersLogger = createLogger({
  levels: config.syslog.levels,

  transports: [transport],
});

var mysqlTransport = new winston.transports.DailyRotateFile({
  filename: "./logs/mysql/%DATE%.log",
  datePattern: "yyyy-MM-DD",
  prepend: true,
  level: "info",
  format: format.combine(
    format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
    format.align(),
    format.printf(
      (info) => `${info.level}: ${[info.timestamp]}: ${info.message}`
    )
  ),
});

const mysqlLogger = createLogger({
  levels: config.syslog.levels,
  transports: [mysqlTransport],
});

module.exports = {
  usersLogger: usersLogger,
  logger: usersLogger,
  mysqlLogger,
};
