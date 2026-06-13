import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import dotenv from 'dotenv';
import path from 'path';

// Import controllers
import { register, login, getMe } from './controllers/auth.controller';
import { unifiedChat, getAvailableModels, getChatHistory, saveChatHistory, deleteChatHistory } from './controllers/chat.controller';
import { createPayment, manualApprovePayment, notifyPaymentCompleted } from './controllers/payment.controller';
import {
  getWorkspaceFiles,
  writeWorkspaceFile,
  deleteWorkspaceFile,
  executeWorkspaceCommand,
  generateWorkspaceCode,
  streamWorkspaceExecute,
  clearWorkspace
} from './controllers/workspace.controller';

// Import middlewares
import { verifySupabaseToken } from './middleware/auth';
import { creditLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Host dynamic sandbox workspace assets publicly (before Helmet to allow iframe integration)
app.use('/sandbox', (req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval'; frame-ancestors *");
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Never cache generated files — every request must read from disk
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}, express.static(path.resolve('d:/Projects/minimalism-ai/sandbox_workspace'), { etag: false, lastModified: false }));

app.use(helmet());
app.use(hpp());
app.use(cors());
app.use(express.json());

// --- PUBLIC ROUTES ---
app.get('/', (req, res) => res.json({ status: 'Minimalism AI Gateway Running', version: '2.0' }));

// Authentication
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// Model catalog (public)
app.get('/api/models', getAvailableModels);

// Admin
app.post('/api/admin/payment/approve', manualApprovePayment);

// --- PROTECTED ROUTES ---
app.use('/api', verifySupabaseToken);

// User Session
app.get('/api/auth/me', getMe);

// Unified Chat (Protected & Credit Limited)
app.post('/api/chat', creditLimiter, unifiedChat);
app.get('/api/chat/history', getChatHistory);
app.post('/api/chat/history', saveChatHistory);
app.delete('/api/chat/history/:id', deleteChatHistory);

// Autonomous Workspace API
app.get('/api/workspace/files', getWorkspaceFiles);
app.post('/api/workspace/write', writeWorkspaceFile);
app.post('/api/workspace/delete', deleteWorkspaceFile);
app.post('/api/workspace/execute', executeWorkspaceCommand);
app.get('/api/workspace/stream-execute', streamWorkspaceExecute);
app.post('/api/workspace/generate', generateWorkspaceCode);
app.post('/api/workspace/clear', clearWorkspace);

// Payment Actions
app.post('/api/payment/charge', createPayment);
app.post('/api/payment/notify', notifyPaymentCompleted);

app.listen(PORT, () => {
  console.log(`Minimalism AI V2.0 Gateway running on port ${PORT}`);
});
