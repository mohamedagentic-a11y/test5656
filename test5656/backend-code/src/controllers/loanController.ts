import { Request, Response } from 'express';
import { query, getClient } from '../db/index';

// Extend Express Request to include user from auth middleware
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const borrowBook = async (req: AuthRequest, res: Response) => {
  const { bookId } = req.body;
  const userId = req.user?.id;

  if (!bookId) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'bookId is required.' }
    });
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Check if book is available
    const bookResult = await client.query(
      'SELECT id, available_copies FROM books WHERE id = $1 FOR UPDATE',
      [bookId]
    );

    if (bookResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Book not found.' }
      });
    }

    const book = bookResult.rows[0];
    if (book.available_copies <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: { code: 'UNAVAILABLE', message: 'Book is currently not available.' }
      });
    }

    // Create loan
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days default loan period

    const loanResult = await client.query(
      `INSERT INTO loans (book_id, user_id, borrow_date, due_date, status) 
       VALUES ($1, $2, CURRENT_TIMESTAMP, $3, 'ACTIVE') RETURNING *`,
      [bookId, userId, dueDate]
    );

    // Update book availability
    await client.query(
      'UPDATE books SET available_copies = available_copies - 1 WHERE id = $1',
      [bookId]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      data: loanResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error borrowing book:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Internal server error.' }
    });
  } finally {
    client.release();
  }
};

export const returnBook = async (req: AuthRequest, res: Response) => {
  const loanId = req.params.id;

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Get loan
    const loanResult = await client.query(
      'SELECT id, book_id, status FROM loans WHERE id = $1 FOR UPDATE',
      [loanId]
    );

    if (loanResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Loan not found.' }
      });
    }

    const loan = loanResult.rows[0];
    if (loan.status === 'RETURNED') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_RETURNED', message: 'Book is already returned.' }
      });
    }

    // Update loan
    await client.query(
      `UPDATE loans SET status = 'RETURNED', return_date = CURRENT_TIMESTAMP WHERE id = $1`,
      [loanId]
    );

    // Update book availability
    await client.query(
      'UPDATE books SET available_copies = available_copies + 1 WHERE id = $1',
      [loan.book_id]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      data: { message: 'Book returned successfully.' }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error returning book:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Internal server error.' }
    });
  } finally {
    client.release();
  }
};

export const renewBook = async (req: AuthRequest, res: Response) => {
  const loanId = req.params.id;
  const userId = req.user?.id;

  try {
    const loanResult = await query(
      'SELECT id, due_date, status, user_id FROM loans WHERE id = $1',
      [loanId]
    );

    if (loanResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Loan not found.' }
      });
    }

    const loan = loanResult.rows[0];

    if (loan.user_id !== userId && req.user?.role !== 'LIBRARIAN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to renew this loan.' }
      });
    }

    if (loan.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Only active loans can be renewed.' }
      });
    }

    // Add 7 days to current due date
    const newDueDate = new Date(loan.due_date);
    newDueDate.setDate(newDueDate.getDate() + 7);

    const updateResult = await query(
      'UPDATE loans SET due_date = $1 WHERE id = $2 RETURNING *',
      [newDueDate, loanId]
    );

    return res.status(200).json({
      success: true,
      data: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Error renewing book:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Internal server error.' }
    });
  }
};

export const reserveBook = async (req: AuthRequest, res: Response) => {
  const { bookId } = req.body;
  const userId = req.user?.id;

  if (!bookId) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'bookId is required.' }
    });
  }

  try {
    const bookResult = await query('SELECT id FROM books WHERE id = $1', [bookId]);
    if (bookResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Book not found.' }
      });
    }

    const reservationResult = await query(
      `INSERT INTO reservations (book_id, user_id, reservation_date, status) 
       VALUES ($1, $2, CURRENT_TIMESTAMP, 'PENDING') RETURNING *`,
      [bookId, userId]
    );

    return res.status(200).json({
      success: true,
      data: reservationResult.rows[0]
    });
  } catch (error) {
    console.error('Error reserving book:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Internal server error.' }
    });
  }
};

export const getLoans = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  try {
    let result;
    if (role === 'LIBRARIAN') {
      result = await query('SELECT * FROM loans ORDER BY borrow_date DESC');
    } else {
      result = await query('SELECT * FROM loans WHERE user_id = $1 ORDER BY borrow_date DESC', [userId]);
    }

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching loans:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Internal server error.' }
    });
  }
};