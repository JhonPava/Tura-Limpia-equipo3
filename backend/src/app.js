require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const { errorHandler, notFoundHandler } = require('./middleware/errors');
const knex = require('./db');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (req, res, next) => {
  try {
    await knex.raw('select 1');
    res.json({ estado: 'ok', baseDatos: 'conectada' });
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
