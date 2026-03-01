import { Request, Response } from 'express';
import { SupportTicketModel } from '../models/support_ticket.model';

export class SupportController {
    async createTicket(req: any, res: Response) {
        try {
            const { category, message } = req.body;
            const userId = req.user._id;

            if (!message || !message.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Message is required'
                });
            }

            const ticket = await SupportTicketModel.create({
                userId,
                category: category || 'general',
                message: message.trim()
            });

            return res.status(201).json({
                success: true,
                data: ticket,
                message: 'Support ticket created successfully'
            });
        } catch (error: any) {
            console.error('Create ticket error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to create support ticket'
            });
        }
    }

    async getMyTickets(req: any, res: Response) {
        try {
            const userId = req.user._id;
            const tickets = await SupportTicketModel.find({ userId })
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                data: tickets
            });
        } catch (error: any) {
            console.error('Get tickets error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch tickets'
            });
        }
    }

    async getAllTickets(req: Request, res: Response) {
        try {
            const { status, priority } = req.query;
            const query: any = {};

            if (status) query.status = status;
            if (priority) query.priority = priority;

            const tickets = await SupportTicketModel.find(query)
                .populate('userId', 'fullName email')
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                data: tickets
            });
        } catch (error: any) {
            console.error('Get all tickets error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch tickets'
            });
        }
    }

    async updateTicketStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status, response } = req.body;

            const updateData: any = {};
            if (status) updateData.status = status;
            if (response) updateData.response = response;

            const ticket = await SupportTicketModel.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: ticket,
                message: 'Ticket updated successfully'
            });
        } catch (error: any) {
            console.error('Update ticket error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to update ticket'
            });
        }
    }
}
