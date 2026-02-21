import Notification from '../models/notification.model';
import { INotification } from '../types/notification.type';

export class NotificationRepository {
    async create(notificationData: Partial<INotification>): Promise<INotification> {
        const notification = new Notification(notificationData);
        return await notification.save();
    }

    async findById(id: string): Promise<INotification | null> {
        return await Notification.findById(id).populate('userId');
    }

    async findByUserId(userId: string): Promise<INotification[]> {
        return await Notification.find({ userId })
            .sort({ createdAt: -1 });
    }

    async findUnreadByUserId(userId: string): Promise<INotification[]> {
        return await Notification.find({ userId, isRead: false })
            .sort({ createdAt: -1 });
    }

    async markAsRead(id: string): Promise<INotification | null> {
        return await Notification.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );
    }

    async markAllAsRead(userId: string): Promise<void> {
        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );
    }

    async delete(id: string): Promise<INotification | null> {
        return await Notification.findByIdAndDelete(id);
    }

    async deleteAllByUserId(userId: string): Promise<void> {
        await Notification.deleteMany({ userId });
    }
}

export default new NotificationRepository();
