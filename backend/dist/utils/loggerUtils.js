export const logger = {
    info: (message, data) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
    },
    error: (message, error) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
    },
    warn: (message, data) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
    },
    debug: (message, data) => {
        console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
    },
};
//# sourceMappingURL=loggerUtils.js.map