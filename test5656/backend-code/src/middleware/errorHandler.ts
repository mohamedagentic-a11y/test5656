import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const message = err.message || 'An unexpected error occurred.';

  console.error(`[Error] ${code}: ${message}`);
  if (statusCode === 500) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};