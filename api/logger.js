import { createLogger, transports, format } from "winston";

export const logger = createLogger({
  level: 'error', // Log only errors and above
  format: format.combine(
    format.timestamp(),
   format.json()
  ),
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.Console(),
  ],
});