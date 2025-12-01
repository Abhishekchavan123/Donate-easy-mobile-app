const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { supabase } = require('../supabaseClient');
require('dotenv').config();

// POST /api/contact - Store contact message & send optional email
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'name, email, subject, and message are required' });
    }

    // 1️⃣ Store message in Supabase
    const { data, error } = await supabase
      .from('contacts')
      .insert([{ name, email, subject, message }])
      .select()
      .single();

    if (error) {
      return res.status(501).json({
        error: 'Storage table missing or RLS preventing insert',
        details: error.message,
      });
    }

    // ✅ Respond immediately (before sending email)
    res.status(201).json({
      ok: true,
      message: 'Message stored successfully in database!',
      contact: data,
    });

    // 2️⃣ Send Email in background (optional)
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.RECEIVER_EMAIL,
        subject: 'New Contact Form Submission - Food Donation',
        text: `
          New contact form message:
          ---------------------------
          Name: ${name}
          Email: ${email}
          Subject: ${subject}
          Message: ${message}
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('📧 Email sent successfully.');
    } catch (emailErr) {
      console.warn('⚠️ Email not sent (check Gmail setup):', emailErr.message);
    }

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// ✅ GET /api/contact - Fetch all contact messages (for Admin Dashboard)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(501).json({
        error: 'Unable to fetch contact messages',
        details: error.message,
      });
    }

    return res.json({ contacts: data || [] });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
