require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const logsRouter = require('./routes/logs');
const analyticsRouter = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000',"https://streakly-gamma.vercel.app"],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

app.use('/api/logs', logsRouter);
app.use('/api/analytics', analyticsRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get("/",(req,res)=>res.send(`Hey Nayab! The bugs are on strike today, so everything should work perfectly. status: ok, deployement: success, env: ${process.env.NODE_ENV}`))

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
