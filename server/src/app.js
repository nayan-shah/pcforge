import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import indexRouter from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

app.use('/api', indexRouter);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

export default app;
