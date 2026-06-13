import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { queryDb } from '../database';
import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

const QRIS_URLS: { [key: string]: string } = {
  pelajar: process.env.QRIS_URL_PELAJAR || 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=QRIS-PELAJAR-15000',
  kode: process.env.QRIS_URL_KODE || 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=QRIS-KODE-49000',
  creator: process.env.QRIS_URL_CREATOR || 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=QRIS-CREATOR-79000'
};

const PLAN_PRICES: { [key: string]: number } = {
  pelajar: 15000,   // Rp 15.000
  kode: 49000,      // Rp 49.000
  creator: 79000    // Rp 79.000
};

// --- INITIALIZE PAYMENT ---
export const createPayment = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { planType } = req.body; // 'pelajar' | 'kode' | 'creator'

    if (!planType || !PLAN_PRICES[planType]) {
      return res.status(400).json({ error: 'Paket pembayaran tidak valid' });
    }

    const price = PLAN_PRICES[planType];
    const reference = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    let paymentData: any = {
      order_id: reference,
      payment_method: 'STATIC_QRIS',
      amount: price,
      status: 'WAITING_FOR_TRANSFER',
      qr_url: QRIS_URLS[planType],
      expired_time: Math.floor(Date.now() / 1000) + 86400 // 24 hours expiration
    };

    // 2. Save payment request to database
    await queryDb.createPayment(user.id, reference, price, planType);

    // 3. (Optional but requested) Notify Admin that an order has been created.
    // If you only want to notify admin WHEN user clicks "I have paid", we can do it via a separate endpoint.
    // For this flow, we notify Admin immediately when the invoice is created.
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      try {
        const msg = `🚨 *PESANAN BARU MASUK*\n\nUser ID: \`${user.id}\`\nPaket: *${planType.toUpperCase()}*\nNominal: *Rp ${price}*\nReference: \`${reference}\`\n\nMenunggu user membayar. Silahkan cek mutasi rekening Anda secara berkala, lalu konfirmasi menggunakan Endpoint Manual Approval.`;
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          chat_id: TELEGRAM_CHAT_ID,
          text: msg,
          parse_mode: 'Markdown'
        });
      } catch (err) {
        console.error('Failed to send Telegram notification:', err);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Instruksi pembayaran berhasil dibuat',
      data: paymentData
    });
  } catch (error) {
    console.error('Create Payment Error:', error);
    return res.status(500).json({ error: 'Gagal membuat pesanan' });
  }
};

// --- MANUAL ADMIN APPROVAL ---
export const manualApprovePayment = async (req: Request, res: Response) => {
  try {
    const { reference, admin_secret } = req.body;
    
    // Keamanan super simpel untuk MVP
    const ADMIN_PASS = process.env.ADMIN_SECRET || 'minimalism123';
    
    if (admin_secret !== ADMIN_PASS) {
      return res.status(403).json({ error: 'Akses Ditolak: Bukan Admin' });
    }

    if (!reference) {
      return res.status(400).json({ error: 'Reference ID tidak boleh kosong' });
    }

    // Lookup payment and update to PAID
    const success = await queryDb.updatePaymentStatus(reference, 'PAID');
    
    if (!success) {
      return res.status(404).json({ error: 'Reference ID tidak ditemukan di database' });
    }

    console.log(`✅ [ADMIN ACTION] Pembayaran berhasil diverifikasi manual untuk: ${reference}`);
    return res.status(200).json({ 
      success: true, 
      message: `Invoice ${reference} berhasil di-upgrade secara manual oleh Admin.` 
    });
  } catch (error) {
    console.error('Manual Approval Error:', error);
    return res.status(500).json({ error: 'Gagal memverifikasi pembayaran' });
  }
};

// --- NOTIFY ADMIN PAYMENT HAS BEEN MADE ---
export const notifyPaymentCompleted = async (req: AuthRequest, res: Response) => {
  try {
    const { reference } = req.body;
    
    if (!reference) return res.status(400).json({ error: 'Reference ID missing' });

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const msg = `💰 *USER KONFIRMASI PEMBAYARAN*\n\nReference: \`${reference}\`\n\nUser mengklaim telah men-scan QRIS dan berhasil mentransfer uang.\n👉 *Lakukan pengecekan mutasi rekening Anda sekarang.*\n\nJika uang benar masuk, gunakan Postman/API untuk mengirim status 'PAID' ke endpoint \`/api/admin/payment/approve\`.`;
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: msg,
        parse_mode: 'Markdown'
      });
    }

    return res.status(200).json({ success: true, message: 'Admin telah dinotifikasi.' });
  } catch (error) {
    return res.status(500).json({ error: 'Gagal mengirim notifikasi' });
  }
};
