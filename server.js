const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(express.static(__dirname)); // Serves files directly from the root folder

let users = [];

app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;
    const existing = users.find(u => u.email === email);
    if (existing) {
        return res.status(400).json({ success: false, message: "Email already registered!" });
    }
    const newUser = { id: 'u_' + Date.now(), name, email, password, balance: 1000 };
    users.push(newUser);
    res.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, balance: newUser.balance } });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(400).json({ success: false, message: "Invalid email or password!" });
    }
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, balance: user.balance } });
});

io.on('connection', (socket) => {
    socket.on('join-room', ({ roomId, teamName }) => {
        socket.join(roomId);
        socket.room = roomId;
        socket.team = teamName;
        socket.to(roomId).emit('peer-joined', { id: socket.id, team: teamName });
    });

    socket.on('disconnect', () => {
        if (socket.room) {
            socket.to(socket.room).emit('peer-left', socket.id);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
