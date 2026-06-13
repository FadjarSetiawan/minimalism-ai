import { Request, Response } from 'express';
import { queryDb, supabase } from '../database';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimal terdiri dari 6 karakter' });
    }

    // Check if user already exists
    const existingUser = await queryDb.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    // Register user
    const newUser = await queryDb.createUser(email, password, 'umum');

    // Return credentials
    const token = `mock_jwt_${newUser.id}`;

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return res.status(500).json({ error: error.message || 'Gagal mendaftar pengguna baru' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi' });
    }

    // Real Supabase Login
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!error && data.user) {
        const dbUser = await queryDb.getUserById(data.user.id);
        return res.status(200).json({
          success: true,
          message: 'Login berhasil (Supabase)',
          token: data.session?.access_token || '',
          user: {
            id: data.user.id,
            email: data.user.email,
            role: dbUser?.role || 'umum'
          }
        });
      }
      console.warn('⚠️ Supabase login failed or not configured, checking local database fallback...');
    }

    // In-Memory Database Login Fallback
    const user = await queryDb.getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const token = `mock_jwt_${user.id}`;

    return res.status(200).json({
      success: true,
      message: 'Login berhasil (Local Fallback)',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Gagal melakukan login' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch fresh details from DB
    const subscription = await queryDb.getSubscription(user.id);
    const ledger = await queryDb.getLedger(user.id);

    return res.status(200).json({
      id: user.id,
      email: user.email,
      role: subscription?.plan_type || 'umum',
      ledger: {
        dailyPromptsUsed: ledger?.daily_prompts_used || 0,
        imageCoinsLeft: ledger?.image_coins_left || 0,
        lastResetDate: ledger?.last_reset_date || ''
      }
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    return res.status(500).json({ error: 'Gagal mengambil data profil' });
  }
};
