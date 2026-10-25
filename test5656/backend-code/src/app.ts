import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/authRoutes';
import { inventoryRouter } from './routes/inventoryRoutes';
import { loanRouter } from './routes/loanRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/books', inventoryRouter);
app.use('/api/v1/loans', loanRouter);

app.use(errorHandler);

export { app };