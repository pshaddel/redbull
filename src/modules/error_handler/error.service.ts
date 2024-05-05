import { ZodError } from "zod";

export function ZodErrorHandler(error: unknown) {
  if (error instanceof ZodError) {
    return error.errors
      .map((err) => `${err.path.join(".")} ${err.message}`)
      .join(", ");
    // Now you can return or throw the formattedErrors
  } else {
    throw error;
  }
}

export class StandardError {
  public error: string;
  public httpStatusCode: number;
  public extraInformation?: string;
  constructor(
    error: ErrorMessages,
    /**
     * We use this for loggs and it should not be sent to the client
     */
    extraInformation?: string
  ) {
    this.error = error;
    this.httpStatusCode = errors[error];
    this.extraInformation = extraInformation;
  }
}

const errors = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  RESOURCE_ALREADY_EXISTS: 409,
  USERNAME_OR_PASSWORD_INCORRECT: 401,
  TOO_MANY_REQUESTS: 429
} as const;
export type ErrorMessages = keyof typeof errors;
