import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export function initializeSocket(httpServer: HttpServer): Server {
    const io = new Server(httpServer, {
        cors: {
            origin: ["http://localhost:3000", "http://localhost:3003"],
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('join_conversation', (conversationId) => {
            socket.join(conversationId);
            console.log(`User joined conversation: ${conversationId}`);
        });

        socket.on('typing', (data) => {
            socket.to(data.conversationId).emit('typing', data);
        });

        socket.on('stop_typing', (data) => {
            socket.to(data.conversationId).emit('stop_typing', data);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
}
