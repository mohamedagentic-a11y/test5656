import { Router } from 'express';
import {
  borrowBook,
  returnBook,
  renewBook,
  reserveBook,
  getLoans
} from '../controllers/loanController';
import { authenticate, authorize } from '../middleware/authMiddleware';

export const loanRouter = Router();

loanRouter.use(authenticate);

loanRouter.get('/', getLoans);
loanRouter.post('/borrow', authorize('MEMBER'), borrowBook);
loanRouter.post('/:id/return', returnBook);
loanRouter.post('/:id/renew', authorize('MEMBER'), renewBook);

// Note: Depending on where this router is mounted, this may resolve to /api/v1/loans/reservations
// or /api/v1/reservations. The API spec defines POST /api/v1/reservations.
loanRouter.post('/reservations', authorize('MEMBER'), reserveBook);