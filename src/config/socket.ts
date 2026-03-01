import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export function initializeSocket(httpServer: HttpServer): Server {
    // Dynamic CORS for Socket.IO to support web and mobile clients
    const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3003",
        process.env.FRONTEND_URL || "",
    ].filter((origin): origin is string => Boolean(origin));

    const io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true
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
