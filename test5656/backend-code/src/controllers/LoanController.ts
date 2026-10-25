import { Request, Response } from 'express';
import { LoanService } from '../services/LoanService';

const loanService = new LoanService();

export class LoanController {
  static async borrow(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { bookId } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User is not authenticated.',
          },
        });
        return;
      }

      if (!bookId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'bookId is required.',
          },
        });
        return;
      }

      const result = await loanService.borrowBook(userId, bookId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to borrow book.',
        },
      });
    }
  }

  static async returnBook(req: Request, res: Response): Promise<void> {
    try {
      const loanId = req.params.id;

      if (!loanId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'loanId is required.',
          },
        });
        return;
      }

      const result = await loanService.returnBook(loanId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to return book.',
        },
      });
    }
  }

  static async renew(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const loanId = req.params.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User is not authenticated.',
          },
        });
        return;
      }

      if (!loanId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'loanId is required.',
          },
        });
        return;
      }

      const result = await loanService.renewLoan(loanId, userId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to renew loan.',
        },
      });
    }
  }
}