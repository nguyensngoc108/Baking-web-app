import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Import routes
import cakeRoutes from './routes/cakes.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging middleware - shows all API requests with status code
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  
  res.on('finish', () => {
    const statusCode = res.statusCode;
    console.log(`[${timestamp}] ${req.method} ${req.path} - Status: ${statusCode}`);
  });
  
  next();
});

// Connect to Database
connectDB();

// Routes
app.use('/api/cakes', cakeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Serve React static files from public folder
app.use(express.static('public'));

// SPA routing - serve index.html for non-API routes
app.get('*', (req, res) => {
  res.sendFile(process.cwd() + '/public/index.html');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
