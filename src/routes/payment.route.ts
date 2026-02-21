import express from 'express';
import { createPaymentIntent, getTransactions, getTransactionStats, getMyTransactions, getWalletBalance, requestPayout } from '../controllers/payment.controller';
import { authorizedMiddleware } from '../middleware/authorization.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { brandMiddleware } from '../middleware/brand.middleware';

const router = express.Router();

router.post('/create-intent', authorizedMiddleware, brandMiddleware, createPaymentIntent);
router.get('/', authorizedMiddleware, adminMiddleware, getTransactions);
router.get('/stats', authorizedMiddleware, adminMiddleware, getTransactionStats);

router.get('/my-transactions', authorizedMiddleware, getMyTransactions);
router.get('/balance', authorizedMiddleware, getWalletBalance); // Add role check if strict
router.post('/payout', authorizedMiddleware, requestPayout);

export default router;
