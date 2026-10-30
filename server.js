require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Body parser
app.use(express.json({ limit: '10kb' }));

// Auto-sync profile photo if present in uploaded cache
const uploadedPhoto = 'C:/Users/Meldrid/.gemini/antigravity/brain/d12cb049-313b-4036-b92a-d0d2d337c3f3/.user_uploaded/media_1792594918226_c2a8709d.jpg';
const imagesDir = path.join(__dirname, 'images');
const localPhoto = path.join(imagesDir, 'mildred.jpg');

try {
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  if (fs.existsSync(uploadedPhoto) && !fs.existsSync(localPhoto)) {
    fs.copyFileSync(uploadedPhoto, localPhoto);
    console.log('✓ Profile photo automatically synced to images/mildred.jpg');
  }
} catch (syncErr) {
  console.warn('Note: Profile photo auto-sync deferred:', syncErr.message);
}

// Dedicated profile image route with fallback to uploaded cache or placeholder
app.get('/images/mildred.jpg', (req, res) => {
  if (fs.existsSync(localPhoto)) {
    return res.sendFile(localPhoto);
  }
  if (fs.existsSync(uploadedPhoto)) {
    return res.sendFile(uploadedPhoto);
  }
  res.sendFile(path.join(imagesDir, 'placeholder-avatar.svg'));
});

// Serve static assets
app.use(express.static(__dirname));

// Simple in-memory rate limiter for contact form (max 5 requests per 10 mins per IP)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

function contactRateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const clientData = rateLimitMap.get(ip) || { count: 0, firstRequestTime: now };

  if (now - clientData.firstRequestTime > RATE_LIMIT_WINDOW_MS) {
    clientData.count = 1;
    clientData.firstRequestTime = now;
  } else {
    clientData.count += 1;
  }

  rateLimitMap.set(ip, clientData);

  if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ message: 'Too many requests. Please wait a few minutes before trying again.' });
  }

  next();
}

// Nodemailer reusable transporter
let transporter = null;
function getTransporter() {
  const user = (process.env.EMAIL_USER || '').trim();
  const pass = (process.env.EMAIL_APP_PASSWORD || '').trim();

  if (!user || !pass) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }
  return transporter;
}

app.post('/api/contact', contactRateLimiter, async (req, res) => {
  const { name, email, subject, message } = req.body || {};

  if (![name, email, subject, message].every(v => typeof v === 'string' && v.trim())) {
    return res.status(400).json({ message: 'Please complete every field.' });
  }

  // Basic email syntax check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  const user = (process.env.EMAIL_USER || '').trim();
  const pass = (process.env.EMAIL_APP_PASSWORD || '').trim();
  const recipient = (process.env.CONTACT_TO || user || 'mildredowoo520@gmail.com').trim();

  if (!user || !pass) {
    return res.status(503).json({
      message: 'Email service is awaiting your 16-character Google App Password in .env.'
    });
  }

  const mailTransporter = getTransporter();
  if (!mailTransporter) {
    return res.status(503).json({
      message: 'Email service could not initialize transporter.'
    });
  }

  // Sanitize subject and name from CRLF injection
  const safeSubject = subject.replace(/[\r\n]+/g, ' ').trim();
  const safeName = name.replace(/[\r\n]+/g, ' ').trim();

  try {
    await mailTransporter.sendMail({
      from: `"Portfolio Contact" <${user}>`,
      to: recipient,
      replyTo: email.trim(),
      subject: `Portfolio message: ${safeSubject}`,
      text: `From: ${safeName}\nEmail: ${email.trim()}\n\n${message.trim()}`
    });

    res.json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Email sending failed:', error.message);
    res.status(500).json({
      message: `Sending failed: ${error.message}. Please verify your Gmail App Password.`
    });
  }
});

// Fallback for HTML routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`\n=================================================`);
  console.log(`Portfolio server running at http://localhost:${port}`);
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.log(`Note: Email credentials not detected in .env.`);
    console.log(`Copy .env.example to .env to enable the contact form.`);
  }
  console.log(`=================================================\n`);
});
