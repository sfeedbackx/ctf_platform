import { AxiosError } from 'axios';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Check if it's an Axios error
    if ('response' in error && error.response) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const status = axiosError.response?.status;
      const message = axiosError.response?.data?.message;

      // Handle specific status codes
      switch (status) {
        case 429:
          return 'Too many requests. Please wait a moment before trying again.';
        case 400:
          return message || 'Invalid request. Please check your input.';
        case 401:
          return 'You need to be logged in to perform this action.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 500:
          return 'Server error. Please try again later.';
        case 503:
          return 'Service temporarily unavailable. Please try again later.';
        default:
          return message || error.message || 'An unexpected error occurred.';
      }
    }

    return error.message;
  }

  return 'An unexpected error occurred.';
};
