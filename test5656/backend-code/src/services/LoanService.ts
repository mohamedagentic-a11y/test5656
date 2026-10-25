import { getClient } from '../config/db';

export class LoanService {
  static async borrowBook(userId: string, bookId: string): Promise<any> {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const bookResult = await client.query(
        'SELECT status FROM books WHERE id = $1 FOR UPDATE',
        [bookId]
      );

      if (bookResult.rows.length === 0) {
        throw new Error('Book not found');
      }

      if (bookResult.rows[0].status !== 'AVAILABLE') {
        throw new Error('Book is not available for borrowing');
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 14 days loan period

      const loanResult = await client.query(
        `INSERT INTO loans (user_id, book_id, borrow_date, due_date, status) 
         VALUES ($1, $2, NOW(), $3, 'ACTIVE') RETURNING *`,
        [userId, bookId, dueDate]
      );

      await client.query(
        "UPDATE books SET status = 'BORROWED' WHERE id = $1",
        [bookId]
      );

      await client.query('COMMIT');
      return loanResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async returnBook(loanId: string): Promise<any> {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const loanResult = await client.query(
        'SELECT book_id, status FROM loans WHERE id = $1 FOR UPDATE',
        [loanId]
      );

      if (loanResult.rows.length === 0) {
        throw new Error('Loan not found');
      }

      if (loanResult.rows[0].status === 'RETURNED') {
        throw new Error('Book is already returned');
      }

      const bookId = loanResult.rows[0].book_id;

      const updatedLoanResult = await client.query(
        `UPDATE loans SET status = 'RETURNED', return_date = NOW() 
         WHERE id = $1 RETURNING *`,
        [loanId]
      );

      await client.query(
        "UPDATE books SET status = 'AVAILABLE' WHERE id = $1",
        [bookId]
      );

      await client.query('COMMIT');
      return updatedLoanResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async renewLoan(loanId: string, userId: string): Promise<any> {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const loanResult = await client.query(
        'SELECT user_id, status, due_date FROM loans WHERE id = $1 FOR UPDATE',
        [loanId]
      );

      if (loanResult.rows.length === 0) {
        throw new Error('Loan not found');
      }

      const loan = loanResult.rows[0];

      if (loan.user_id !== userId) {
        throw new Error('Unauthorized to renew this loan');
      }

      if (loan.status !== 'ACTIVE') {
        throw new Error('Only active loans can be renewed');
      }

      const newDueDate = new Date(loan.due_date);
      newDueDate.setDate(newDueDate.getDate() + 7); // Renew for 7 days

      const updatedLoanResult = await client.query(
        'UPDATE loans SET due_date = $1 WHERE id = $2 RETURNING *',
        [newDueDate, loanId]
      );

      await client.query('COMMIT');
      return updatedLoanResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}