export interface JWTPayload {
  id: string;
  numberOfSolvedCtf: number;
}

interface TokenValidationSuccess {
  valid: true;
  payload: JWTPayload;
}

interface TokenValidationError {
  valid: false;
  error: string;
}

export type TokenValidationResult =
  | TokenValidationSuccess
  | TokenValidationError;
