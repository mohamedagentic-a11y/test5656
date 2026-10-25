import { Router } from 'express';
import { LoanController } from '../controllers/LoanController';
import { authenticate, authorize } from '../middleware/auth';

const loanRouter = Router();
const loanController = new LoanController();

loanRouter.post(
  '/borrow',
  authenticate,
  authorize('MEMBER'),
  loanController.borrow.bind(loanController)
);

loanRouter.post(
  '/:id/return',
  authenticate,
  loanController.returnBook.bind(loanController)
);

loanRouter.post(
  '/:id/renew',
  authenticate,
  authorize('MEMBER'),
  loanController.renew.bind(loanController)
);

export { loanRouter };