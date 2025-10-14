import { NextResponse } from 'next/server';

export const ERROR_CODES = {
  DATABASE_ERROR: 'database_error',
  INVALID_INPUT: 'invalid_input',
  INVALID_FORMAT: 'invalid_format',
  MISSING_REQUIRED_FIELD: 'missing_required_field',
  INTERNAL_SERVER_ERROR: 'internal_server_error',
  NOT_FOUND: 'not_found',
  DUPLICATE_ENTRY: 'duplicate_entry',
};

/**
 * Creates a standardized successful API response.
 * @param data The payload to send.
 * @param status The HTTP status code, defaults to 200.
 * @returns A NextResponse object.
 */
export const apiSuccess = <T>(data: T, status: number = 200) => {
  return NextResponse.json({ success: true, data }, { status });
};

/**
 * Creates a standardized error API response.
 * @param message The user-friendly error message.
 * @param code A short, machine-readable error code.
 * @param status The HTTP status code.
 * @returns A NextResponse object.
 */
export const apiError = (message: string, code: string, status: number) => {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
};

/**
 * Creates a standardized 500 internal server error response.
 * Logs the provided error message.
 * @param message The error message to log.
 * @returns A NextResponse object.
 */
export const serverError = (message: string) => {
  console.error('Server Error:', message);
  return apiError(
    'An internal server error occurred.',
    ERROR_CODES.INTERNAL_SERVER_ERROR,
    500
  );
};
