import { io } from 'socket.io-client';

export const socket = io('http://localhost:8081'); // адрес твоего Node.js сервера
