import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { RequestError, ValidationError } from '../http-errors';

export type ResponseType = 'api' | 'server';

function formatResponse(
  responseType: ResponseType,
  status: number,
  message: string,
  errors?: Record<string, string[]> | undefined,
) {
  const responseContent = {
    success: false,
    error: {
      message,
      details: errors,
    },
  };

  // Returns a NextResponse for API routes, or a plain object for server actions
  return responseType === 'api'
    ? NextResponse.json(responseContent, { status })
    : { status, ...responseContent };
}

export default function handleError(
  error: unknown,
  responseType: ResponseType = 'server',
) {
  // Typed errors already carry their own statusCode and field-level errors
  if (error instanceof RequestError) {
    return formatResponse(
      responseType,
      error.statusCode,
      error.message,
      error.errors,
    );
  }

  // Converts a raw ZodError into a ValidationError shape before formatting
  if (error instanceof ZodError) {
    const validationError = new ValidationError(
      error.flatten().fieldErrors as Record<string, string[]>,
    );

    return formatResponse(
      responseType,
      validationError.statusCode,
      validationError.message,
      validationError.errors,
    );
  }

  // Plain Error instances are reported as 500
  if (error instanceof Error) {
    return formatResponse(responseType, 500, error.message);
  }

  // Non-Error throws (strings, objects, etc.) are reported as 500
  return formatResponse(responseType, 500, 'An unexpected error occurred');
}
