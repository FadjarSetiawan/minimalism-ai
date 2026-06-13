import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = supabaseUrl !== '' && supabaseAnonKey !== '';

export let isSupabaseResponsive = isSupabaseConfigured;

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const withTimeout = <T>(promise: PromiseLike<T>, ms: number = 2500): Promise<T> => {
  return Promise.race([
    promise as Promise<T>,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Supabase request timed out")), ms))
  ]);
};

if (supabase) {
  withTimeout(supabase.from('users').select('id').limit(1), 1500)
    .then(() => {
      console.log("✅ Minimalism AI: Supabase database connection verified.");
    })
    .catch((err) => {
      console.warn("⚠️ Minimalism AI: Supabase configured but unresponsive (paused or offline). Falling back to stateful offline database.");
      isSupabaseResponsive = false;
    });
}

// In-Memory Database for local mock fallback (with JSON persistence)
class InMemoryDB {
  public users: any[] = [];
  public subscriptions: any[] = [];
  public ledgers: any[] = [];
  public payments: any[] = [];
  public chats: any[] = [];
  private filePath = path.resolve(__dirname, '../db.json');

  constructor() {
    this.load();
    
    // Create a default developer/test account if empty
    if (this.users.length === 0) {
      console.log('🔄 Minimalism AI: Initializing default database record');
      const defaultUser = {
        id: 'usr_default_123',
        email: 'fadjar@minimalism.ai',
        password: 'password123', // Simple text for local MVP testing
        role: 'umum'
      };
      
      this.users.push(defaultUser);
      
      this.subscriptions.push({
        id: 'sub_default_123',
        user_id: 'usr_default_123',
        plan_type: 'umum',
        active_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      this.ledgers.push({
        user_id: 'usr_default_123',
        daily_prompts_used: 0,
        image_coins_left: 5,
        last_reset_date: new Date().toISOString().split('T')[0]
      });
      
      this.save();
    }
  }

  private load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, 'utf8');
        const data = JSON.parse(fileContent);
        this.users = data.users || [];
        this.subscriptions = data.subscriptions || [];
        this.ledgers = data.ledgers || [];
        this.payments = data.payments || [];
        this.chats = data.chats || [];
        console.log('🔄 Minimalism AI: Loaded persistent database state from db.json');
      } else {
        console.log('🔄 Minimalism AI: db.json not found, using clean in-memory state');
      }
    } catch (err) {
      console.error('⚠️ Error loading db.json:', err);
    }
  }

  private save() {
    try {
      const data = {
        users: this.users,
        subscriptions: this.subscriptions,
        ledgers: this.ledgers,
        payments: this.payments,
        chats: this.chats
      };
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('⚠️ Error saving to db.json:', err);
    }
  }

  // Auth Operations
  async getUserByEmail(email: string) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async getUserById(id: string) {
    return this.users.find(u => u.id === id) || null;
  }

  async createUser(email: string, passwordHash: string, role: string = 'umum') {
    const id = `usr_${Math.random().toString(36).substr(2, 9)}`;
    const user = { id, email, password: passwordHash, role };
    this.users.push(user);

    // Create default subscription (umum)
    this.subscriptions.push({
      id: `sub_${Math.random().toString(36).substr(2, 9)}`,
      user_id: id,
      plan_type: 'umum',
      active_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

    // Create token ledger
    this.ledgers.push({
      user_id: id,
      daily_prompts_used: 0,
      image_coins_left: 5,
      last_reset_date: new Date().toISOString().split('T')[0]
    });

    this.save();
    return user;
  }

  // Subscription Operations
  async getSubscription(userId: string) {
    const sub = this.subscriptions.find(s => s.user_id === userId);
    if (!sub) return null;
    
    // Check if expired
    const now = new Date();
    const expired = new Date(sub.active_until) < now;
    if (expired && sub.plan_type !== 'umum') {
      sub.plan_type = 'umum'; // Fallback to free
      this.save();
    }
    return sub;
  }

  async upgradeSubscription(userId: string, planType: string) {
    const sub = this.subscriptions.find(s => s.user_id === userId);
    const activeUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    if (sub) {
      sub.plan_type = planType;
      sub.active_until = activeUntil;
    } else {
      this.subscriptions.push({
        id: `sub_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        plan_type: planType,
        active_until: activeUntil
      });
    }

    // Grant or reset coins for Creator if upgraded
    const ledger = await this.getLedger(userId);
    if (ledger) {
      if (planType === 'creator') {
        ledger.image_coins_left = 50; // Special creator koin
      }
    }
    
    // Update user role too
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.role = planType;
    }

    this.save();
    return true;
  }

  // Ledger Operations
  async getLedger(userId: string) {
    let ledger = this.ledgers.find(l => l.user_id === userId);
    let changed = false;

    if (!ledger) {
      ledger = {
        user_id: userId,
        daily_prompts_used: 0,
        image_coins_left: 5,
        last_reset_date: new Date().toISOString().split('T')[0]
      };
      this.ledgers.push(ledger);
      changed = true;
    }
    
    // Reset if it's a new day
    const todayStr = new Date().toISOString().split('T')[0];
    if (ledger.last_reset_date !== todayStr) {
      ledger.daily_prompts_used = 0;
      ledger.last_reset_date = todayStr;
      
      // Reset daily coins based on plan
      const sub = await this.getSubscription(userId);
      if (sub && sub.plan_type === 'creator') {
        ledger.image_coins_left = Math.max(ledger.image_coins_left, 10); // refill creator
      }
      changed = true;
    }

    if (changed) {
      this.save();
    }

    return ledger;
  }

  async incrementPromptsUsed(userId: string) {
    const ledger = await this.getLedger(userId);
    if (ledger) {
      ledger.daily_prompts_used += 1;
      this.save();
    }
    return ledger;
  }

  async consumeImageCoin(userId: string) {
    const ledger = await this.getLedger(userId);
    if (ledger && ledger.image_coins_left > 0) {
      ledger.image_coins_left -= 1;
      this.save();
      return true;
    }
    return false;
  }

  // Payment Operations
  async createPayment(userId: string, reference: string, amount: number, planType: string) {
    const payment = {
      id: `pay_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      reference,
      amount,
      plan_type: planType,
      status: 'UNPAID',
      created_at: new Date().toISOString()
    };
    this.payments.push(payment);
    this.save();
    return payment;
  }

  async getPaymentByReference(reference: string) {
    return this.payments.find(p => p.reference === reference) || null;
  }

  async updatePaymentStatus(reference: string, status: string) {
    const payment = this.payments.find(p => p.reference === reference);
    if (payment) {
      payment.status = status;
      if (status === 'PAID') {
        await this.upgradeSubscription(payment.user_id, payment.plan_type);
      }
      this.save();
      return true;
    }
    return false;
  }

  // Chat Operations
  async getChats(userId: string, segment: string) {
    return this.chats
      .filter(c => c.user_id === userId && c.segment === segment)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  async saveChat(userId: string, id: string, title: string, segment: string, messages: any[]) {
    let chat = this.chats.find(c => c.id === id && c.user_id === userId);
    const now = new Date().toISOString();
    
    if (chat) {
      chat.title = title;
      chat.messages = messages;
      chat.updated_at = now;
    } else {
      chat = {
        id,
        user_id: userId,
        title,
        segment,
        messages,
        updated_at: now
      };
      this.chats.push(chat);
    }
    this.save();
    return chat;
  }

  async deleteChat(userId: string, id: string) {
    this.chats = this.chats.filter(c => !(c.id === id && c.user_id === userId));
    this.save();
    return true;
  }
}

export const db = new InMemoryDB();


// Interface for actual database calls if Supabase is active
export const queryDb = {
  getUserByEmail: async (email: string) => {
    if (supabase && isSupabaseResponsive) {
      try {
        const { data, error } = await withTimeout(supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single());
        if (!error && data) return data;
      } catch (err) {
        console.warn('⚠️ Supabase getUserByEmail error, using local fallback:', err);
      }
    }
    return db.getUserByEmail(email);
  },

  getUserById: async (id: string) => {
    if (supabase && isSupabaseResponsive) {
      try {
        const { data, error } = await withTimeout(supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single());
        if (!error && data) return data;
      } catch (err) {
        console.warn('⚠️ Supabase getUserById error, using local fallback:', err);
      }
    }
    return db.getUserById(id);
  },

  createUser: async (email: string, passwordHash: string, role: string = 'umum') => {
    if (supabase && isSupabaseResponsive) {
      try {
        // Supabase Auth handles password hash
        const { data: authData, error: authError } = await withTimeout(supabase.auth.signUp({
          email,
          password: passwordHash, // In real Supabase, signUp takes plain text password
        }));

        if (authError) {
          throw authError;
        }

        if (authData.user) {
          // Add to users table
          const { data, error } = await withTimeout(supabase
            .from('users')
            .insert({ id: authData.user.id, email, role })
            .select()
            .single());

          if (error) throw error;

          // Add default subscription
          await withTimeout(supabase.from('subscriptions').insert({
            user_id: authData.user.id,
            plan_type: role,
            active_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }));

          // Add token ledger
          await withTimeout(supabase.from('token_ledgers').insert({
            user_id: authData.user.id,
            daily_prompts_used: 0,
            image_coins_left: 5,
            last_reset_date: new Date().toISOString().split('T')[0]
          }));

          return data;
        }
      } catch (err: any) {
        console.warn('⚠️ Supabase signUp failed (falling back to In-Memory DB registration):', err.message || err);
        // Fall through to In-Memory DB below
      }
    }
    return db.createUser(email, passwordHash, role);
  },

  getSubscription: async (userId: string) => {
    if (supabase && isSupabaseResponsive) {
      try {
        const { data, error } = await withTimeout(supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single());
        
        if (!error && data) {
          const now = new Date();
          const expired = new Date(data.active_until) < now;
          if (expired && data.plan_type !== 'umum') {
            // Fallback
            await withTimeout(supabase
              .from('subscriptions')
              .update({ plan_type: 'umum' })
              .eq('user_id', userId));
            
            await withTimeout(supabase
              .from('users')
              .update({ role: 'umum' })
              .eq('id', userId));

            data.plan_type = 'umum';
          }
          return data;
        }
      } catch (err) {
        console.warn('⚠️ Supabase getSubscription error, using local fallback:', err);
      }
    }
    return db.getSubscription(userId);
  },

  upgradeSubscription: async (userId: string, planType: string) => {
    if (supabase && isSupabaseResponsive) {
      try {
        const activeUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const { error: subErr } = await withTimeout(supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            plan_type: planType,
            active_until: activeUntil
          }));
        if (subErr) throw subErr;

        // Update role in users
        await withTimeout(supabase
          .from('users')
          .update({ role: planType })
          .eq('id', userId));

        // Reset coins if Creator
        if (planType === 'creator') {
          await withTimeout(supabase
            .from('token_ledgers')
            .update({ image_coins_left: 50 })
            .eq('user_id', userId));
        }

        return true;
      } catch (err) {
        console.warn('⚠️ Supabase upgradeSubscription error, using local fallback:', err);
      }
    }
    return db.upgradeSubscription(userId, planType);
  },

  getLedger: async (userId: string) => {
    if (supabase && isSupabaseResponsive) {
      try {
        let { data, error } = await withTimeout(supabase
          .from('token_ledgers')
          .select('*')
          .eq('user_id', userId)
          .single());
        
        const todayStr = new Date().toISOString().split('T')[0];

        if (error || !data) {
          const { data: newLedger, error: insErr } = await withTimeout(supabase
            .from('token_ledgers')
            .insert({
              user_id: userId,
              daily_prompts_used: 0,
              image_coins_left: 5,
              last_reset_date: todayStr
            })
            .select()
            .single());
          if (insErr) throw insErr;
          data = newLedger;
        }

        if (data && data.last_reset_date !== todayStr) {
          // Reset daily limits
          const sub = await queryDb.getSubscription(userId);
          const imageCoins = sub?.plan_type === 'creator' ? 50 : 5;
          
          const { data: updated, error: updErr } = await withTimeout(supabase
            .from('token_ledgers')
            .update({
              daily_prompts_used: 0,
              image_coins_left: imageCoins,
              last_reset_date: todayStr
            })
            .eq('user_id', userId)
            .select()
            .single());
          if (!updErr) {
            data = updated;
          }
        }

        return data;
      } catch (err) {
        console.warn('⚠️ Supabase getLedger error, using local fallback:', err);
      }
    }
    return db.getLedger(userId);
  },

  incrementPromptsUsed: async (userId: string) => {
    if (supabase && isSupabaseResponsive) {
      try {
        const ledger = await queryDb.getLedger(userId);
        if (!ledger) return null;
        
        const { data, error } = await withTimeout(supabase
          .from('token_ledgers')
          .update({ daily_prompts_used: ledger.daily_prompts_used + 1 })
          .eq('user_id', userId)
          .select()
          .single());
        if (error) return null;
        return data;
      } catch (err) {
        console.warn('⚠️ Supabase incrementPromptsUsed error, using local fallback:', err);
      }
    }
    return db.incrementPromptsUsed(userId);
  },

  consumeImageCoin: async (userId: string) => {
    if (supabase && isSupabaseResponsive) {
      try {
        const ledger = await queryDb.getLedger(userId);
        if (!ledger || ledger.image_coins_left <= 0) return false;

        const { error } = await withTimeout(supabase
          .from('token_ledgers')
          .update({ image_coins_left: ledger.image_coins_left - 1 })
          .eq('user_id', userId));
        return !error;
      } catch (err) {
        console.warn('⚠️ Supabase consumeImageCoin error, using local fallback:', err);
      }
    }
    return db.consumeImageCoin(userId);
  },

  createPayment: async (userId: string, reference: string, amount: number, planType: string) => {
    if (supabase && isSupabaseResponsive) {
      try {
        const { data, error } = await withTimeout(supabase
          .from('payments')
          .insert({
            user_id: userId,
            reference,
            amount,
            plan_type: planType,
            status: 'UNPAID',
            created_at: new Date().toISOString()
          })
          .select()
          .single());
        
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('⚠️ Supabase createPayment failed, falling back to local payment tracking:', err);
        return db.createPayment(userId, reference, amount, planType);
      }
    }
    return db.createPayment(userId, reference, amount, planType);
  },

  updatePaymentStatus: async (reference: string, status: string) => {
    if (supabase && isSupabaseResponsive) {
      try {
        const { data, error } = await withTimeout(supabase
          .from('payments')
          .update({ status })
          .eq('reference', reference)
          .select()
          .single());
        
        if (error || !data) {
          return db.updatePaymentStatus(reference, status);
        }

        if (status === 'PAID') {
          await queryDb.upgradeSubscription(data.user_id, data.plan_type);
        }
        return true;
      } catch (err) {
        console.warn('⚠️ Supabase updatePaymentStatus failed, falling back to local:', err);
        return db.updatePaymentStatus(reference, status);
      }
    }
    return db.updatePaymentStatus(reference, status);
  },

  getChats: async (userId: string, segment: string) => {
    if (supabase && isSupabaseResponsive) {
      try {
        const { data, error } = await withTimeout(supabase
          .from('chats')
          .select('*')
          .eq('user_id', userId)
          .eq('segment', segment)
          .order('updated_at', { ascending: false }));
        if (!error && data) return data;
      } catch (err) {
        console.warn('⚠️ Supabase getChats error, using local fallback:', err);
      }
    }
    return db.getChats(userId, segment);
  },

  saveChat: async (userId: string, id: string, title: string, segment: string, messages: any[]) => {
    if (supabase && isSupabaseResponsive) {
      try {
        const now = new Date().toISOString();
        const { data, error } = await withTimeout(supabase
          .from('chats')
          .upsert({
            id,
            user_id: userId,
            title,
            segment,
            messages,
            updated_at: now
          })
          .select()
          .single());
        if (!error && data) return data;
      } catch (err) {
        console.warn('⚠️ Supabase saveChat error, using local fallback:', err);
      }
    }
    return db.saveChat(userId, id, title, segment, messages);
  },

  deleteChat: async (userId: string, id: string) => {
    if (supabase && isSupabaseResponsive) {
      try {
        const { error } = await withTimeout(supabase
          .from('chats')
          .delete()
          .eq('id', id)
          .eq('user_id', userId));
        if (!error) return true;
      } catch (err) {
        console.warn('⚠️ Supabase deleteChat error, using local fallback:', err);
      }
    }
    return db.deleteChat(userId, id);
  }
};
