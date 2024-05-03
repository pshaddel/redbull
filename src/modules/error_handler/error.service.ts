import { ZodError } from "zod";

export function ZodErrorHandler(error: unknown) {
  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map((err) => ({
      path: err.path.join("."),
      message: err.message
    }));
    // Now you can return or throw the formattedErrors
    return formattedErrors;
  } else {
    throw error;
  }
}
