import TransactionModel from '../models/transaction.model';
import { ITransaction } from '../types/transaction.type';

export class PaymentRepository {
    async createTransaction(transactionData: Partial<ITransaction>): Promise<ITransaction> {
        const transaction = new TransactionModel(transactionData);
        return await transaction.save();
    }

    async findTransactionById(id: string): Promise<ITransaction | null> {
        return await TransactionModel.findById(id)
            .populate('userId')
            .populate('campaignId');
    }

    async findTransactionsByUserId(userId: string): Promise<ITransaction[]> {
        return await TransactionModel.find({ userId })
            .populate('campaignId')
            .sort({ createdAt: -1 });
    }

    async findTransactionsByCampaignId(campaignId: string): Promise<ITransaction[]> {
        return await TransactionModel.find({ campaignId })
            .populate('userId')
            .sort({ createdAt: -1 });
    }

    async updateTransactionStatus(id: string, status: string): Promise<ITransaction | null> {
        return await TransactionModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
    }

    async findAll(filter: any = {}): Promise<ITransaction[]> {
        return await TransactionModel.find(filter)
            .populate('userId')
            .populate('campaignId')
            .sort({ createdAt: -1 });
    }
}

export default new PaymentRepository();
