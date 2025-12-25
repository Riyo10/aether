import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

// --- Authentication Middleware ---
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    orgId: string;
  };
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Use 'any' cast to bypass strict type checking if 'headers' property is missing in definition
  const authHeader = (req as any).headers?.authorization;

  if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // In a real scenario, verify JWT here using jsonwebtoken
    // For this architecture step, we simulate decoding:
    if (token === 'demo-token') {
       req.user = { id: 'user_123', role: 'architect', orgId: 'org_aether_01' };
       return next();
    }
    
    // Simulate valid verification for non-empty tokens in dev
    if (config.NODE_ENV === 'development') {
        req.user = { id: 'dev_user', role: 'admin', orgId: 'dev_org' };
        return next();
    }

    throw new Error('Invalid Token');
  } catch (error) {
    return res.status(403).json({ error: 'Forbidden: Invalid credentials' });
  }
};

// --- Rate Limiting Middleware ---
export const apiLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS, 
  max: config.RATE_LIMIT_MAX_REQUESTS, 
  standardHeaders: true, 
  legacyHeaders: false, 
  keyGenerator: (req: Request) => {
    // Rate limit by User ID if auth'd, otherwise by IP
    return (req as AuthenticatedRequest).user?.id || req.ip || 'unknown';
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'You have exceeded your execution quota. Please upgrade your plan.'
    });
  }
});