import { NotificationModel } from '../models/notification.model';
import { INotification } from '../types/notification.type';

export class NotificationRepository {
    async create(notificationData: Partial<INotification>): Promise<INotification> {
        const notification = new NotificationModel(notificationData);
        return await notification.save();
    }

    async findById(id: string): Promise<INotification | null> {
        return await NotificationModel.findById(id).populate('userId');
    }

    async findByUserId(userId: string): Promise<INotification[]> {
        return await NotificationModel.find({ userId })
            .sort({ createdAt: -1 });
    }

    async findUnreadByUserId(userId: string): Promise<INotification[]> {
        return await NotificationModel.find({ userId, isRead: false })
            .sort({ createdAt: -1 });
    }

    async markAsRead(id: string): Promise<INotification | null> {
        return await NotificationModel.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );
    }

    async markAllAsRead(userId: string): Promise<void> {
        await NotificationModel.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );
    }

    async delete(id: string): Promise<INotification | null> {
        return await NotificationModel.findByIdAndDelete(id);
    }

    async deleteAllByUserId(userId: string): Promise<void> {
        await NotificationModel.deleteMany({ userId });
    }
}

export default new NotificationRepository();
