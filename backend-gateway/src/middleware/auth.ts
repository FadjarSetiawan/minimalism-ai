import { Request, Response, NextFunction } from 'express';
import { supabase, queryDb, isSupabaseResponsive } from '../database';

export interface AuthRequest extends Request {
  user?: any;
}

export const verifySupabaseToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      token = authHeader.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token as string;
    }

    if (!token) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    // Mock Token Support for Local Development
    if (token.startsWith('mock_jwt_')) {
      const userId = token.replace('mock_jwt_', '');
      const user = await queryDb.getUserById(userId);
      if (!user) {
        return res.status(401).json({ error: 'Invalid mock token' });
      }
      req.user = user;
      return next();
    }

    // Real Supabase Token Support
    if (supabase && isSupabaseResponsive) {
      try {
        const { data: { user }, error } = await Promise.race([
          supabase.auth.getUser(token),
          new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Supabase token query timed out")), 2500))
        ]);

        if (error || !user) {
          return res.status(401).json({ error: 'Invalid Supabase token' });
        }

        // Fetch user profile role from our users table
        const dbUser = await queryDb.getUserById(user.id);
        if (dbUser) {
          req.user = dbUser;
        } else {
          // Fallback to supabase user
          req.user = { id: user.id, email: user.email, role: 'umum' };
        }
        return next();
      } catch (err: any) {
        console.warn('⚠️ Supabase token validation failed or timed out:', err.message || err);
        return res.status(401).json({ 
          error: 'Supabase database is currently unresponsive (paused or offline). Please use a local mock account.' 
        });
      }
    }

    return res.status(401).json({ 
      error: 'Supabase database is offline. Please register/log in with a mock local account.' 
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
