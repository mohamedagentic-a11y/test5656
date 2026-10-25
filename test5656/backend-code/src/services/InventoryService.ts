import { query, getClient } from '../config/db';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  totalCopies: number;
  availableCopies: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookDTO {
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  totalCopies: number;
}

export interface UpdateBookDTO {
  title?: string;
  author?: string;
  isbn?: string;
  publishedYear?: number;
  totalCopies?: number;
}

export class InventoryService {
  static async searchBooks(
    searchQuery: string = '',
    page: number = 1,
    limit: number = 20
  ): Promise<{ books: Book[]; total: number }> {
    const offset = (page - 1) * limit;
    
    const countResult = await query(
      `SELECT COUNT(*) FROM books WHERE title ILIKE $1 OR author ILIKE $1 OR isbn ILIKE $1`,
      [`%${searchQuery}%`]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await query(
      `SELECT * FROM books 
       WHERE title ILIKE $1 OR author ILIKE $1 OR isbn ILIKE $1 
       ORDER BY title ASC 
       LIMIT $2 OFFSET $3`,
      [`%${searchQuery}%`, limit, offset]
    );

    return {
      books: result.rows,
      total
    };
  }

  static async getBookById(id: string): Promise<Book | null> {
    const result = await query(`SELECT * FROM books WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  static async addBook(data: CreateBookDTO): Promise<Book> {
    const result = await query(
      `INSERT INTO books (title, author, isbn, published_year, total_copies, available_copies) 
       VALUES ($1, $2, $3, $4, $5, $5) 
       RETURNING *`,
      [data.title, data.author, data.isbn, data.publishedYear, data.totalCopies]
    );
    return result.rows[0];
  }

  static async updateBook(id: string, data: UpdateBookDTO): Promise<Book | null> {
    const currentBook = await this.getBookById(id);
    if (!currentBook) return null;

    const title = data.title ?? currentBook.title;
    const author = data.author ?? currentBook.author;
    const isbn = data.isbn ?? currentBook.isbn;
    const publishedYear = data.publishedYear ?? currentBook.publishedYear;
    
    let totalCopies = currentBook.totalCopies;
    let availableCopies = currentBook.availableCopies;

    if (data.totalCopies !== undefined) {
      const diff = data.totalCopies - currentBook.totalCopies;
      totalCopies = data.totalCopies;
      availableCopies = currentBook.availableCopies + diff;
      
      if (availableCopies < 0) {
        throw new Error('Cannot reduce total copies below currently borrowed amount');
      }
    }

    const result = await query(
      `UPDATE books 
       SET title = $1, author = $2, isbn = $3, published_year = $4, total_copies = $5, available_copies = $6, updated_at = NOW() 
       WHERE id = $7 
       RETURNING *`,
      [title, author, isbn, publishedYear, totalCopies, availableCopies, id]
    );

    return result.rows[0];
  }

  static async deleteBook(id: string): Promise<boolean> {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      
      const bookResult = await client.query(`SELECT available_copies, total_copies FROM books WHERE id = $1`, [id]);
      if (bookResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return false;
      }

      const book = bookResult.rows[0];
      if (book.available_copies !== book.total_copies) {
        throw new Error('Cannot delete book with active loans');
      }

      await client.query(`DELETE FROM books WHERE id = $1`, [id]);
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}