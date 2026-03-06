import { Request, Response } from 'express';
import Transaction from '../models/transaction.model';
import { CampaignModel as Campaign } from '../models/campaign.model';
import mongoose from 'mongoose';

export const createPaymentIntent = async (req: any, res: Response) => {
    try {
        const { campaignId, amount } = req.body;
        const brandId = req.user.id;

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }

        const platformFee = amount * 0.15;
        const netAmount = amount - platformFee;

        const transaction = new Transaction({
            campaignId,
            brandId,
            amount,
            platformFee,
            netAmount,
            type: 'payment',
            status: 'pending',
            description: `Funding for campaign: ${campaign.title}`,
            stripePaymentIntentId: 'mock_stripe_id_' + Date.now(), // Placeholder
        });

        await transaction.save();

        res.status(200).json({
            success: true,
            transaction,
            message: 'Payment intent created successfully (Mock)',
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTransactions = async (req: any, res: Response) => {
    try {
        const transactions = await Transaction.find()
            .populate('brandId', 'fullName email')
            .populate('campaignId', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, transactions });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTransactionStats = async (req: Request, res: Response) => {
    try {
        const stats = await Transaction.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$platformFee' },
                    totalVolume: { $sum: '$amount' },
                    transactionCount: { $sum: 1 },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            stats: stats[0] || { totalRevenue: 0, totalVolume: 0, transactionCount: 0 },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMyTransactions = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const transactions = await Transaction.find({
            $or: [{ brandId: userId }, { influencerId: userId }]
        })
            .populate('brandId', 'fullName')
            .populate('influencerId', 'fullName')
            .populate('campaignId', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, transactions });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getWalletBalance = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const earningsAgg = await Transaction.aggregate([
            { $match: { influencerId: new mongoose.Types.ObjectId(userId), type: 'payment', status: 'released' } },
            { $group: { _id: null, total: { $sum: '$netAmount' } } }
        ]);
        const totalEarnings = earningsAgg.length > 0 ? earningsAgg[0].total : 0;

        const withdrawalsAgg = await Transaction.aggregate([
            { $match: { influencerId: new mongoose.Types.ObjectId(userId), type: 'payout', status: { $in: ['pending', 'funded', 'released'] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalWithdrawals = withdrawalsAgg.length > 0 ? withdrawalsAgg[0].total : 0;
        const currentBalance = totalEarnings - totalWithdrawals;

        const pendingPayoutsAgg = await Transaction.aggregate([
            { $match: { influencerId: new mongoose.Types.ObjectId(userId), type: 'payout', status: 'pending' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const pendingPayouts = pendingPayoutsAgg.length > 0 ? pendingPayoutsAgg[0].total : 0;

        res.status(200).json({ success: true, data: { totalEarnings, totalWithdrawals, currentBalance, pendingPayouts } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const requestPayout = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { amount, method } = req.body;

        if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

        const earningsAgg = await Transaction.aggregate([
            { $match: { influencerId: new mongoose.Types.ObjectId(userId), type: 'payment', status: 'released' } },
            { $group: { _id: null, total: { $sum: '$netAmount' } } }
        ]);
        const totalEarnings = earningsAgg.length > 0 ? earningsAgg[0].total : 0;

        const withdrawalsAgg = await Transaction.aggregate([
            { $match: { influencerId: new mongoose.Types.ObjectId(userId), type: 'payout', status: { $in: ['pending', 'funded', 'released'] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const currentBalance = totalEarnings - (withdrawalsAgg.length > 0 ? withdrawalsAgg[0].total : 0);

        if (amount > currentBalance) return res.status(400).json({ success: false, message: 'Insufficient balance' });

        const transaction = new Transaction({
            brandId: userId,
            influencerId: userId,
            amount,
            platformFee: 0,
            netAmount: amount,
            type: 'payout',
            status: 'pending',
            description: `Payout request via ${method}`
        });

        await transaction.save();

        return res.status(201).json({ success: true, message: 'Payout request submitted', transaction });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
