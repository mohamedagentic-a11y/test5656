import { Request, Response } from 'express';
import { InventoryService, CreateBookDTO, UpdateBookDTO } from '../services/InventoryService';

export class InventoryController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  public getBooks = async (req: Request, res: Response): Promise<void> => {
    try {
      const searchQuery = (req.query.search as string) || '';
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;

      const result = await this.inventoryService.searchBooks(searchQuery, page, limit);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'An error occurred while fetching books.'
        }
      });
    }
  };

  public getBookById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const book = await this.inventoryService.getBookById(id);

      if (!book) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Book not found.'
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: book
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'An error occurred while fetching the book.'
        }
      });
    }
  };

  public addBook = async (req: Request, res: Response): Promise<void> => {
    try {
      const bookData: CreateBookDTO = req.body;
      const newBook = await this.inventoryService.addBook(bookData);

      res.status(201).json({
        success: true,
        data: newBook
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message || 'Invalid input data.'
        }
      });
    }
  };

  public updateBook = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const bookData: UpdateBookDTO = req.body;
      
      const updatedBook = await this.inventoryService.updateBook(id, bookData);

      if (!updatedBook) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Book not found.'
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedBook
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message || 'Invalid input data.'
        }
      });
    }
  };

  public deleteBook = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await this.inventoryService.deleteBook(id);

      if (!success) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Book not found.'
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { deleted: true }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'An error occurred while deleting the book.'
        }
      });
    }
  };
}