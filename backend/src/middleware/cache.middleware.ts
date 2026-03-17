import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../utils/cache';
import { logger } from '../utils/logger';

export const cacheMiddleware = (keyPrefix: string, ttl?: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `${keyPrefix}:${req.originalUrl}`;
    const cachedData = cacheService.get(key);

    if (cachedData) {
      logger.debug(`Cache hit: ${key}`);
      res.json(cachedData);
      return;
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode === 200) {
        cacheService.set(key, body, ttl);
        logger.debug(`Cache set: ${key}`);
      }
      return originalJson(body);
    };

    next();
  };
};
