const { createLogger, format, transports, config } = require('winston');

const usersLogger = createLogger({

    levels: config.syslog.levels,

    transports: [
        new transports.File({
            filename: 'logs/qe-admin-be.log',
            format: format.combine(
                format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
                format.align(),
                format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
            )
        }),

    ]
});

module.exports = {
    usersLogger: usersLogger
};