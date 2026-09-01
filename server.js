import 'dotenv/config';
import express from 'express';
import { sendLeadEmail } from './api/send-lead-email.js';
import { createPayment } from './api/create-payment.js';
import { confirmPayment } from './api/confirm-payment.js';
import checkMember from './api/check-member.js';
import admin from './api/admin.js';

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(express.json());

// CORS — only allow requests from our Vite dev server and the deployed origin
app.use((req, res, next) => {
  const allowed = [
    'http://localhost:3000',
    'https://aifounderhub.com',
    process.env.APP_URL,
  ].filter(Boolean);
  const origin = req.headers.origin;
  if (!origin || allowed.some(o => origin.startsWith(o))) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.post('/api/send-lead-email', sendLeadEmail);
app.post('/api/create-payment', createPayment);
app.post('/api/confirm-payment', confirmPayment);
app.post('/api/check-member', checkMember);
app.post('/api/admin', admin);

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  ⚡ API server running on http://localhost:${PORT}\n`);
});
