import express from 'express';
import { MessageController } from '../controllers/messaging.controller';
import { authorizedMiddleware } from '../middleware/authorization.middleware';
import { messageUpload } from '../middleware/upload.middleware';

const router = express.Router();

router.get('/conversations', authorizedMiddleware, MessageController.getConversations);
router.get('/conversation/:conversationId', authorizedMiddleware, MessageController.getMessages);
router.post('/send', authorizedMiddleware, messageUpload.array('attachments', 5), MessageController.sendMessage);
router.patch('/conversation/:conversationId/read', authorizedMiddleware, MessageController.markConversationAsRead);
router.patch('/:messageId/read', authorizedMiddleware, MessageController.markAsRead);

export default router;
