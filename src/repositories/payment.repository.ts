import Transaction from '../models/transaction.model';
import { ITransaction } from '../types/transaction.type';

export class PaymentRepository {
    async createTransaction(transactionData: Partial<ITransaction>): Promise<ITransaction> {
        const transaction = new Transaction(transactionData);
        return await transaction.save();
    }

    async findTransactionById(id: string): Promise<ITransaction | null> {
        return await Transaction.findById(id)
            .populate('userId')
            .populate('campaignId');
    }

    async findTransactionsByUserId(userId: string): Promise<ITransaction[]> {
        return await Transaction.find({ userId })
            .populate('campaignId')
            .sort({ createdAt: -1 });
    }

    async findTransactionsByCampaignId(campaignId: string): Promise<ITransaction[]> {
        return await Transaction.find({ campaignId })
            .populate('userId')
            .sort({ createdAt: -1 });
    }

    async updateTransactionStatus(id: string, status: string): Promise<ITransaction | null> {
        return await Transaction.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
    }

    async findAll(filter: any = {}): Promise<ITransaction[]> {
        return await Transaction.find(filter)
            .populate('userId')
            .populate('campaignId')
            .sort({ createdAt: -1 });
    }
}

export default new PaymentRepository();
