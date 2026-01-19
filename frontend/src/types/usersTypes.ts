export type RegisterData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type User = {
  id: string;
  email: string;
  username?: string;
  solvedCtf: string[];
  numberOfSolvedCtf: number;
};
