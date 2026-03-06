import { Request, Response } from 'express';
import { NotificationModel } from '../models/notification.model';

export const NotificationController = {
    getNotifications: async (req: any, res: Response) => {
        try {
            const notifications = await NotificationModel.find({ userId: req.user._id })
                .sort({ createdAt: -1 })
                .limit(50);

            res.status(200).json({ success: true, notifications });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getUnreadCount: async (req: any, res: Response) => {
        try {
            const count = await NotificationModel.countDocuments({
                userId: req.user._id,
                isRead: false
            });

            res.status(200).json({ success: true, count });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    markAsRead: async (req: Request, res: Response) => {
        try {
            const { notificationId } = req.params;
            const notification = await NotificationModel.findByIdAndUpdate(notificationId, {
                isRead: true,
                readAt: new Date()
            }, { new: true });

            res.status(200).json({ success: true, notification });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    markAllRead: async (req: any, res: Response) => {
        try {
            await NotificationModel.updateMany({
                userId: req.user._id,
                isRead: false
            }, {
                isRead: true,
                readAt: new Date()
            });

            res.status(200).json({ success: true, message: "All notifications marked as read" });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    deleteNotification: async (req: Request, res: Response) => {
        try {
            const { notificationId } = req.params;
            const notification = await NotificationModel.findByIdAndDelete(notificationId);
            
            if (!notification) {
                return res.status(404).json({ success: false, message: "Notification not found" });
            }
            
            res.status(200).json({ success: true, message: "Notification deleted" });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
