const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: name ? { full_name: name } : undefined
      }
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ user: data.user });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(401).json({ error: error.message });
    }

    return res.json({ user: data.user, session: data.session });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

// PUT /api/auth/profile - update user profile (requires Bearer access token)
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const { name } = req.body || {};
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Create a scoped client with the user's access token
    const { createClient } = require('@supabase/supabase-js');
    const userClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });

    // Optionally verify token is valid
    const userRes = await userClient.auth.getUser(token);
    if (userRes.error) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Update user metadata using accessToken option to avoid session requirement
    const { data, error } = await userClient.auth.updateUser(
      { data: { full_name: name } },
      { accessToken: token }
    );
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ user: data.user });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});


