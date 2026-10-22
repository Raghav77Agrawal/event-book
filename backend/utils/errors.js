class AppError extends Error {
  constructor(message, statusCode = 500, details = undefined) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

const createError = (statusCode, message, details) => new AppError(message, statusCode, details);

module.exports = { AppError, createError };
