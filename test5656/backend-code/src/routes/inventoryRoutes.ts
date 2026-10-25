import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController';
import { authenticate, authorize } from '../middleware/auth';

export const inventoryRouter = Router();
const inventoryController = new InventoryController();

inventoryRouter.get(
  '/',
  authenticate,
  inventoryController.getBooks.bind(inventoryController)
);

inventoryRouter.get(
  '/:id',
  authenticate,
  inventoryController.getBookById.bind(inventoryController)
);

inventoryRouter.post(
  '/',
  authenticate,
  authorize('LIBRARIAN'),
  inventoryController.addBook.bind(inventoryController)
);

inventoryRouter.put(
  '/:id',
  authenticate,
  authorize('LIBRARIAN'),
  inventoryController.updateBook.bind(inventoryController)
);

inventoryRouter.delete(
  '/:id',
  authenticate,
  authorize('LIBRARIAN'),
  inventoryController.deleteBook.bind(inventoryController)
);