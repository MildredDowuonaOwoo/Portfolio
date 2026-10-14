require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10kb' }));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/style.css', (req, res) => res.sendFile(path.join(__dirname, 'style.css')));
app.get('/app.js', (req, res) => res.sendFile(path.join(__dirname, 'app.js')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body || {};

  if (![name, email, subject, message].every(value =>
      typeof value === 'string' && value.trim())) {
    return res.status(400).json({ message: 'Please complete every field.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_TO,
      replyTo: email.trim(),
      subject: `Portfolio message: ${subject.trim()}`,
      text: `From: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`
    });

    res.json({ message: 'Message sent.' });
  } catch (error) {
    console.error('Email sending failed:', error.message);
    res.status(500).json({ message: 'The message could not be sent.' });
  }
});

app.listen(port, () => {
  console.log(`Portfolio server running at http://localhost:${port}`);
});