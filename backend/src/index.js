const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/assets');
const ticketRoutes = require('./routes/tickets');
const userRoutes = require('./routes/users');

const app = express();

app.use(helmet());
app.use(cors({
  origin: [
    'https://asset-incident-management.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Asset & Incident Management API running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;