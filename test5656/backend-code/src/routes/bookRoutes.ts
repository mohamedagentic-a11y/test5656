import { Router } from 'express';
import { getBooks, addBook, updateBook, deleteBook } from '../controllers/bookController';
import { authenticate, authorize } from '../middleware/authMiddleware';

export const bookRouter = Router();

// GET /api/v1/books - Searches and retrieves the book catalogue. Auth: Required (Any)
bookRouter.get('/', authenticate, getBooks);

// POST /api/v1/books - Adds a new book to the catalogue. Auth: Required (Librarian)
bookRouter.post('/', authenticate, authorize('LIBRARIAN'), addBook);

// PUT /api/v1/books/:id - Updates book details. Auth: Required (Librarian)
bookRouter.put('/:id', authenticate, authorize('LIBRARIAN'), updateBook);

// DELETE /api/v1/books/:id - Removes a book from the catalogue. Auth: Required (Librarian)
bookRouter.delete('/:id', authenticate, authorize('LIBRARIAN'), deleteBook);