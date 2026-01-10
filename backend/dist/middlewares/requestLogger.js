import { logger } from '../utils/loggerUtils.js';
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    // Log when response finishes
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('HTTP Request', {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
        });
    });
    next();
};
//# sourceMappingURL=requestLogger.js.map