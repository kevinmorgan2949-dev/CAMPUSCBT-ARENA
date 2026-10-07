const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(express.static(path.join(__dirname)));

let users = [];
let rooms = [];
let marketplaceNotes = [
    { id: 'n1', title: 'Gns 101 Comprehensive Lecture Notes', price: 500, author: 'Admin' },
    { id: 'n2', title: 'Advanced Petroleum Engineering Guide', price: 1500, author: 'Prof. Ahmed' }
];

// Auth Endpoints
app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;
    const existing = users.find(u => u.email === email);
    if (existing) {
        return res.status(400).json({ success: false, message: "Email already registered!" });
    }
    const newUser = { id: 'u_' + Date.now(), name, email, password, balance: 1000 };
    users.push(newUser);
    res.json({ success: true, user: newUser });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(400).json({ success: false, message: "Invalid email or password!" });
    }
    res.json({ success: true, user });
});

// Wallet Funding & Promo Code Endpoints
app.post('/api/fund-wallet', (req, res) => {
    const { userId, amount } = req.body;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(400).json({ success: false, message: "User not found" });
    
    user.balance += Number(amount);
    res.json({ success: true, newBalance: user.balance });
});

app.post('/api/redeem-promo', (req, res) => {
    const { userId, code } = req.body;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    if (code.toUpperCase() === 'PTI100' || code.toUpperCase() === 'FREEADS') {
        user.balance += 100;
        return res.json({ success: true, newBalance: user.balance, message: "₦100 promo added successfully!" });
    }
    res.status(400).json({ success: false, message: "Invalid or expired promo code!" });
});

// Marketplace & Note Unlocking
app.get('/api/notes', (req, res) => {
    res.json({ success: true, notes: marketplaceNotes });
});

app.post('/api/publish-note', (req, res) => {
    const { title, price, author } = req.body;
    const newNote = { id: 'n_' + Date.now(), title, price: Number(price), author: author || 'Student' };
    marketplaceNotes.push(newNote);
    res.json({ success: true, note: newNote, message: "PDF successfully published to marketplace!" });
});

app.post('/api/unlock-note', (req, res) => {
    const { userId, noteId } = req.body;
    const user = users.find(u => u.id === userId);
    const note = marketplaceNotes.find(n => n.id === noteId);

    if (!user || !note) {
        return res.status(400).json({ success: false, message: "User or note not found!" });
    }

    if (user.balance < note.price) {
        return res.status(400).json({ success: false, message: "Insufficient wallet balance to unlock note!" });
    }

    user.balance -= note.price;
    res.json({ success: true, newBalance: user.balance, message: `Successfully unlocked ${note.title}!` });
});

// Room Creation & CBT Arena Logic
app.post('/api/create-room', (req, res) => {
    const { roomName, teamName, duration, stake, pdfs, hostId } = req.body;
    const user = users.find(u => u.id === hostId);
    
    if (user && user.balance < Number(stake)) {
        return res.status(400).json({ success: false, message: "Insufficient wallet balance to fund this room!" });
    }

    if (user) {
        user.balance -= Number(stake);
    }

    const newRoom = {
        id: 'room_' + Date.now(),
        roomName,
        teamName,
        duration,
        stake,
        pdfs,
        hostBalance: user ? user.balance : 1000,
        link: `/arena.html?room=room_${Date.now()}`
    };

    rooms.push(newRoom);
    res.json({ success: true, room: newRoom, newBalance: user ? user.balance : 1000 });
});

app.get('/api/rooms', (req, res) => {
    res.json({ success: true, rooms });
});

io.on('connection', (socket) => {
    socket.on('join-room', ({ roomId, teamName }) => {
        socket.join(roomId);
        socket.room = roomId;
        socket.team = teamName;
        
        const sampleQuestions = [
            { question: "What is the primary product of fractional distillation of crude oil?", options: ["Gasoline / Petrol", "Bitumen", "Lubricating oil", "Wax"], answer: 0 },
            { question: "Which petroleum engineering parameter defines rock fluid flow capacity?", options: ["Porosity", "Permeability", "Viscosity", "Saturation"], answer: 1 }
        ];

        socket.emit('cbt-questions', sampleQuestions);
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
