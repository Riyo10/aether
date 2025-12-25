
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import { authenticate, apiLimiter, AuthenticatedRequest } from './middleware/security';
import { executeAgentWorkflow } from './services/proxy';

const app = express();

// --- Global Middleware ---
app.use(helmet()); // Security Headers
app.use(cors({ origin: '*' })); // Configure strictly in production
app.use(express.json({ limit: '1mb' })); // Body parsing
app.use(morgan('dev')); // Logging

// --- Health Check ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', version: '1.0.0', env: config.NODE_ENV });
});

// --- Secure Gateway Routes ---
// POST /v1/execute
// The single entry point for the UI to trigger agents.
app.post(
  '/api/v1/execute',
  apiLimiter,   // Enforce Rate Limits
  authenticate, // Enforce Auth
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { model, prompt, systemInstruction } = req.body;

      if (!model || !prompt) {
        return res.status(400).json({ error: 'Missing required fields: model, prompt' });
      }

      // Delegate to Proxy Service
      const result = await executeAgentWorkflow(req as AuthenticatedRequest, {
        model,
        prompt,
        systemInstruction
      });

      // Normalize Response for UI
      res.json({
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          gateway_id: 'gw-01'
        }
      });
    } catch (error: any) {
      next(error);
    }
  }
);

// --- Global Error Handler ---
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Gateway Error]', err);
  res.status(err.status || 500).json({
    error: 'Internal Gateway Error',
    message: config.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// --- Server Start ---
app.listen(config.PORT, () => {
  console.log(`
  ┌──────────────────────────────────────────────────┐
  │  Aether Secure Gateway is running                │
  │                                                  │
  │  ➜ Local:   http://localhost:${config.PORT}          │
  │  ➜ Env:     ${config.NODE_ENV}                     │
  └──────────────────────────────────────────────────┘
  `);
});
