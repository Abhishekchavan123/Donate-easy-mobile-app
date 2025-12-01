require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: '*', methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/api/auth', require('./src/routes/auth'));
// NGO routes
app.use('/api/ngos', require('./src/routes/ngo'));
// Donations routes
app.use('/api/donations', require('./src/routes/donations'));
// Contact routes
app.use('/api/contact', require('./src/routes/contact'));
app.use('/api/donations-A', require('./src/routes/donations-A'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});


