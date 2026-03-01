import { Request, Response } from 'express';
import { ConversationModel } from '../models/conversation.model';
import { MessageModel } from '../models/message.model';
import { UserModel } from '../models/user.model';

export const MessageController = {
    // Get all conversations for the current user
    getConversations: async (req: any, res: Response) => {
        try {
            const conversations = await ConversationModel.find({
                'participants.user': req.user._id
            })
                .populate('participants.user', 'fullName email isInfluencer role profilePicture')
                .populate('lastMessage')
                .sort({ updatedAt: -1 });

            res.status(200).json({ success: true, conversations });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get messages for a specific conversation
    getMessages: async (req: Request, res: Response) => {
        try {
            const { conversationId } = req.params;
            const messages = await MessageModel.find({ conversationId })
                .populate('sender', 'fullName email profilePicture')
                .sort({ createdAt: 1 });

            res.status(200).json({ success: true, messages });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Send a new message
    sendMessage: async (req: any, res: Response) => {
        try {
            const { conversationId, content, receiverId, campaignId } = req.body;
            let existingConversationId = conversationId;

            // Process uploaded files
            const attachments = req.files ? (req.files as Express.Multer.File[]).map((file: Express.Multer.File) => {
                const fileType = file.mimetype.startsWith('image/') ? 'image' : 
                               file.mimetype.startsWith('video/') ? 'video' : 'document';
                
                return {
                    type: fileType,
                    url: `/uploads/${file.filename}`,
                    name: file.originalname,
                    size: file.size
                };
            }) : [];

            // Validate that at least content or attachments are provided
            if (!content?.trim() && attachments.length === 0) {
                return res.status(400).json({ success: false, message: "Message must have content or attachments" });
            }

            // If no conversationId, check if one exists between these users or create a new one
            if (!existingConversationId && receiverId) {
                let conversation = await ConversationModel.findOne({
                    'participants.user': { $all: [req.user._id, receiverId] },
                    campaignId: campaignId || null
                });

                if (!conversation) {
                    const receiver = await UserModel.findById(receiverId);
                    if (!receiver) {
                        return res.status(404).json({ success: false, message: "Receiver not found" });
                    }

                    conversation = await ConversationModel.create({
                        participants: [
                            {
                                user: req.user._id,
                                role: req.user.isInfluencer ? 'influencer' : (req.user.role === 'admin' ? 'admin' : 'brand')
                            },
                            {
                                user: receiverId,
                                role: receiver.isInfluencer ? 'influencer' : (receiver.role === 'admin' ? 'admin' : 'brand')
                            }
                        ],
                        campaignId: campaignId || null
                    });
                }
                existingConversationId = conversation._id;
            }

            if (!existingConversationId) {
                return res.status(400).json({ success: false, message: "Either conversationId or receiverId is required" });
            }

            const message = await MessageModel.create({
                conversationId: existingConversationId,
                sender: req.user._id,
                senderRole: req.user.isInfluencer ? 'influencer' : (req.user.role === 'admin' ? 'admin' : 'brand'),
                content: content || '',
                attachments
            });

            // Populate sender details before sending response
            const populatedMessage = await MessageModel.findById(message._id)
                .populate('sender', 'fullName email profilePicture');

            // Get the other participant's ID for unread count
            const conversation = await ConversationModel.findById(existingConversationId);
            const otherParticipant = conversation?.participants.find(
                (p: any) => p.user.toString() !== req.user._id.toString()
            );

            // Update conversation with last message and increment unread count
            if (otherParticipant) {
                await ConversationModel.findByIdAndUpdate(existingConversationId, {
                    lastMessage: message._id,
                    $inc: { [`unreadCount.${otherParticipant.user}`]: 1 }
                });
            } else {
                await ConversationModel.findByIdAndUpdate(existingConversationId, {
                    lastMessage: message._id
                });
            }

            // Emit real-time event with populated message
            req.io.to(existingConversationId.toString()).emit('new_message', populatedMessage);

            res.status(201).json({ success: true, message: populatedMessage });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Mark all messages in a conversation as read
    markConversationAsRead: async (req: any, res: Response) => {
        try {
            const { conversationId } = req.params;
            const userId = req.user._id;

            // Update all messages where I am NOT the sender
            await MessageModel.updateMany(
                { conversationId, sender: { $ne: userId }, isRead: false },
                { isRead: true, readAt: new Date() }
            );

            // Reset unread count for this user in the conversation
            await ConversationModel.findByIdAndUpdate(conversationId, {
                $set: { [`unreadCount.${userId}`]: 0 }
            });

            // Emit event to inform other participants (optional, useful for read status in UI)
            req.io.to(conversationId).emit('messages_read', { conversationId, userId });

            res.status(200).json({ success: true, message: "Conversation marked as read" });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Mark individual message as read
    markAsRead: async (req: any, res: Response) => {
        try {
            const { messageId } = req.params;
            const message = await MessageModel.findByIdAndUpdate(messageId, {
                isRead: true,
                readAt: new Date()
            }, { new: true });

            if (message) {
                // Decrement unread count for the user
                await ConversationModel.findByIdAndUpdate(message.conversationId, {
                    $inc: { [`unreadCount.${req.user._id}`]: -1 }
                });
            }

            res.status(200).json({ success: true, message });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
