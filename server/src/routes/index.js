import express from 'express';
import authRouter from './authRoutes.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'PCForge API root route' });
});

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'PCForge API is running',
  });
});

router.use('/auth', authRouter);

export default router;
