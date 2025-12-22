export interface AppError extends Error {
  status?: number;
}

export enum ERROR_NAME {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED_ERROR = 'UNAUTHORIZED_ERROR',
}
