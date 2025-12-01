const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');

// POST /api/ngos/register - capture volunteer application
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, transport, areas, days, times } = req.body || {};
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'name, email, phone are required' });
    }

    // Normalize arrays to strings for broad compatibility
    const normDays = Array.isArray(days) ? days.join(', ') : (days || '');
    const normTimes = Array.isArray(times) ? times.join(', ') : (times || '');

    // Try to persist into a generic table. Requires you to create this table in Supabase:
    // create table volunteer_submissions (
    //   id uuid primary key default gen_random_uuid(),
    //   name text not null,
    //   email text not null,
    //   phone text not null,
    //   transport text,
    //   areas text,
    //   days text,
    //   times text,
    //   created_at timestamptz default now()
    // );
    const { data, error } = await supabase.from('volunteer_submissions').insert([
      {
        name,
        email,
        phone,
        transport: transport || '',
        areas: areas || '',
        days: normDays,
        times: normTimes
      }
    ]).select().single();

    if (error) {
      // Relation does not exist or RLS error – return a helpful message
      return res.status(501).json({
        error: 'Storage table missing or RLS preventing insert',
        details: error.message,
        hint: 'Create table volunteer_submissions and allow inserts (RLS policy) for anon key or use service role.'
      });
    }

    return res.status(201).json({ ok: true, submission: data });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/register', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('volunteer_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(501).json({ error: 'Unable to fetch NGO data', details: error.message });
    }

    return res.json({ ngos: data || [] });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;



