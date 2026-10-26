import { Request, Response } from 'express';
import { query } from '../db/index';

export const getBooks = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const searchQuery = req.query.search as string;

    let sql = 'SELECT * FROM books';
    const params: any[] = [];

    if (searchQuery) {
      sql += ' WHERE title ILIKE $1 OR author ILIKE $1';
      params.push(`%${searchQuery}%`);
      sql += ' ORDER BY title ASC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      sql += ' ORDER BY title ASC LIMIT $1 OFFSET $2';
      params.push(limit, offset);
    }

    const result = await query(sql, params);

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch books.'
      }
    });
  }
};

export const addBook = async (req: Request, res: Response) => {
  try {
    const { title, author, isbn, publishedYear, totalCopies } = req.body;

    if (!title || !author || !isbn || totalCopies === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data.'
        }
      });
    }

    const sql = `
      INSERT INTO books (title, author, isbn, published_year, total_copies, available_copies)
      VALUES ($1, $2, $3, $4, $5, $5)
      RETURNING *
    `;
    const result = await query(sql, [title, author, isbn, publishedYear, totalCopies]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to add book.'
      }
    });
  }
};

export const updateBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, author, isbn, publishedYear, totalCopies } = req.body;

    const sql = `
      UPDATE books
      SET title = COALESCE($1, title),
          author = COALESCE($2, author),
          isbn = COALESCE($3, isbn),
          published_year = COALESCE($4, published_year),
          total_copies = COALESCE($5, total_copies)
      WHERE id = $6
      RETURNING *
    `;
    const result = await query(sql, [title, author, isbn, publishedYear, totalCopies, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Book not found.'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update book.'
      }
    });
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sql = 'DELETE FROM books WHERE id = $1 RETURNING id';
    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Book not found.'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: { id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete book.'
      }
    });
  }
};