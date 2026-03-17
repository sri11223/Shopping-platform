import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const sessionMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  let sessionId = req.headers['x-session-id'] as string;

  if (!sessionId) {
    sessionId = uuidv4();
  }

  (req as any).sessionId = sessionId;
  next();
};
