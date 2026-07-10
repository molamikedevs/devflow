export class RequestError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(
    statusCode: number,
    message: string,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'RequestError';
  }
}

export class ValidationError extends RequestError {
  constructor(fieldErrors: Record<string, string[]>) {
    const message = ValidationError.formatFieldErrors(fieldErrors);
    super(400, message, fieldErrors);
    this.errors = fieldErrors;
    this.name = 'ValidationError';
  }

  // Builds a single human-readable message from Zod's per-field error map
  static formatFieldErrors(errors: Record<string, string[]>): string {
    const formattedMessages = Object.entries(errors).map(
      ([field, messages]) => {
        const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
        const firstMessage = messages[0] ?? '';

        // Handles both Zod 3 ("Required") and Zod 4 ("Invalid input: expected...")
        // required-field wording, normalizing both into "X is required"
        if (
          firstMessage === 'Required' ||
          firstMessage.toLowerCase().includes('received undefined')
        ) {
          return `${fieldName} is required`;
        }
        return messages.join(' and ');
      },
    );

    return formattedMessages.join(', ');
  }
}

export class NotFoundError extends RequestError {
  constructor(resource: string) {
    super(404, `${resource} not found!`);
    this.name = 'NotFoundError';
  }
}

export class ForbiddenError extends RequestError {
  constructor(message: string = 'Forbidden') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

export class UnauthorizedError extends RequestError {
  constructor(message: string = 'Unauthorized') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

// Used when a request conflicts with existing state (e.g. duplicate
// email/username on create) — maps to HTTP 409
export class ConflictError extends RequestError {
  constructor(message: string = 'Conflict') {
    super(409, message);
    this.name = 'ConflictError';
  }
}
