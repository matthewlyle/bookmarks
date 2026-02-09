/**
 * Base class for application-specific errors.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Error thrown when a resource is not found.
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    super(
      identifier ? `${resource} not found: ${identifier}` : `${resource} not found`,
      "NOT_FOUND"
    );
    this.name = "NotFoundError";
  }
}

/**
 * Error thrown when validation fails.
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

/**
 * Error thrown when a resource already exists.
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, "CONFLICT");
    this.name = "ConflictError";
  }
}

/**
 * Error thrown when a database operation fails.
 */
export class DatabaseError extends AppError {
  constructor(message: string, public readonly cause?: Error) {
    super(message, "DATABASE_ERROR");
    this.name = "DatabaseError";
  }
}
