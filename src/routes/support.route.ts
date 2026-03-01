import { Router } from 'express';
import { SupportController } from '../controllers/support.controller';
import { authorizedMiddleware } from '../middleware/authorization.middleware';

const router = Router();
const supportController = new SupportController();

// User routes
router.post('/tickets', authorizedMiddleware, supportController.createTicket);
router.get('/tickets/my', authorizedMiddleware, supportController.getMyTickets);

// Admin routes
router.get('/tickets', authorizedMiddleware, supportController.getAllTickets);
router.patch('/tickets/:id', authorizedMiddleware, supportController.updateTicketStatus);

export default router;
