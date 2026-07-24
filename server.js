const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('مستخدم جديد متصل، المعرّف:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`المستخدم ${socket.id} انضم للغرفة ${roomId}`);

        socket.to(roomId).emit('user-connected', socket.id);

        socket.on('offer', (payload) => {
            io.to(payload.target).emit('offer', {
                caller: socket.id,
                sdp: payload.sdp
            });
        });

        socket.on('answer', (payload) => {
            io.to(payload.target).emit('answer', {
                caller: socket.id,
                sdp: payload.sdp
            });
        });

        socket.on('ice-candidate', (payload) => {
            io.to(payload.target).emit('ice-candidate', {
                caller: socket.id,
                candidate: payload.candidate
            });
        });

        socket.on('disconnect', () => {
            console.log(`المستخدم ${socket.id} غادر`);
            socket.to(roomId).emit('user-disconnected', socket.id);
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`خادم الإشارات يعمل بنجاح على المنفذ ${PORT}`);
});
