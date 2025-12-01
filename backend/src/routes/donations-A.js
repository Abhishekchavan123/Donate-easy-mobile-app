const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');

// GET /api/donations-A - list ALL donations (admin only)
router.get('/', async (req, res) => {
  try {
    // Admin authentication check (you can enhance this)
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(501).json({
        error: 'Storage table missing or RLS preventing select',
        details: error.message
      });
    }

    return res.json({ donations: data || [] });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;