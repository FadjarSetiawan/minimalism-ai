import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { queryDb } from '../database';

export const creditLimiter = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // Check if user has any credits remaining
    const ledger = await queryDb.getLedger(user.id);
    if (!ledger) {
      return res.status(500).json({ error: 'Could not load user credit balance.' });
    }

    const creditsUsed = ledger.daily_prompts_used || 0;
    const maxCredits = 15; // Default daily cap for free tier

    // Check subscription for higher limits
    const sub = await queryDb.getSubscription(user.id);
    let effectiveMax = maxCredits;
    if (sub?.plan_type === 'pro') effectiveMax = 5000;
    if (sub?.plan_type === 'ultra') effectiveMax = 20000;

    if (creditsUsed >= effectiveMax) {
      return res.status(403).json({
        error: 'Daily credit limit reached. Please upgrade your plan for more credits.',
        creditsUsed,
        maxCredits: effectiveMax
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error checking credit balance.' });
  }
};

// Keep old export name for backward compatibility
export const tokenLimiter = (planType: string) => creditLimiter;
