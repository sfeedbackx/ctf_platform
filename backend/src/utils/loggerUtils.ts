export const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
  },

  error: (message: string, error?: Record<string, unknown>) => {
    console.error(
      `[ERROR] ${new Date().toISOString()} - ${message}`,
      error || '',
    );
  },

  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
  },

  debug: (message: string, data?: Record<string, unknown>) => {
    console.debug(
      `[DEBUG] ${new Date().toISOString()} - ${message}`,
      data || '',
    );
  },
};
