import { Server } from 'socket.io';
import { setupApp } from './app';

const mockIo = {
    on: jest.fn(),
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    sockets: {
        emit: jest.fn(),
    },
} as unknown as Server;

const app = setupApp(mockIo);

export default app;
