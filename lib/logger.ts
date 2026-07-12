import pino from 'pino';

const isEdge = process.env.NEXT_RUNTIME === 'edge';
const isProduction = process.env.NODE_ENV === 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // Pretty-printed, colorized logs only in local dev — edge runtime and
  // production get plain structured JSON output
  transport:
    !isEdge && !isProduction
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
          },
        }
      : undefined,
  formatters: {
    // Uppercases the log level string (e.g. "info" -> "INFO")
    level: (level) => ({ level: level.toUpperCase() }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
