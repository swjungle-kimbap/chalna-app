// src/utils/socket.ts
// import { io, Socket } from 'socket.io-client';
import {io, Socket} from "socket.io-client";

const SOCKET_URL = 'http://your-socket-server-url'; // Replace with your server URL

const socket: Socket = io(SOCKET_URL, {
    transports: ['websocket'],
    autoConnect: false,
});

export default socket;
