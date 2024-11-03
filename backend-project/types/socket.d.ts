// backend-project/types/socket.d.js

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

export function initializeSocket(server: HTTPServer): void;

export const io: SocketIOServer;