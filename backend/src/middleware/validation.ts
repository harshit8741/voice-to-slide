// Request validation middleware using Zod

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Middleware to validate request bodies using Zod schemas
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error: any) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.errors || [{ message: 'Invalid request data' }],
      });
    }
  };
};

/**
 * Middleware to validate query parameters using Zod schemas
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData;
      next();
    } catch (error: any) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.errors || [{ message: 'Invalid query parameters' }],
      });
    }
  };
};