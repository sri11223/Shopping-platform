import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  } else if ((err as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
    code = 'DUPLICATE';
  }

  logger.error(`[${req.method}] ${req.originalUrl} - ${statusCode}: ${message}`, {
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      ...(config.isDevelopment && { stack: err.stack }),
    },
  });
};

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(AppError.notFound(`Route ${req.originalUrl} not found`));
};
