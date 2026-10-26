import express, { Request, Response, NextFunction } from 'express';
import { authRouter } from './routes/authRoutes';
import { bookRouter } from './routes/bookRoutes';
import { loanRouter } from './routes/loanRoutes';

const app = express();

app.use(express.json());

const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/books`, bookRouter);
app.use(`${API_PREFIX}/loans`, loanRouter);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found.',
    },
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred.',
    },
  });
});

const PORT = process.env.PORT;
if (!PORT) {
  console.error('FATAL: PORT environment variable is required.');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});