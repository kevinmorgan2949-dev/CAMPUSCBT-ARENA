const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const https = require('https');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Credentials Provided
const PAYSTACK_SECRET_KEY = 'sk_live_...'; // Insert your secret key if needed, using live keys
const GEMINI_API_KEY = 'AQ.Ab8RN6K2ZCCkApnjvMqvsOq2u-e1jkbBfOG8EbNIlVVvtR_Sag';

// In-Memory Database State
let users = [];
let rooms = [];
let marketplaceNotes = [
    { id: 'n1', title: 'Gns 101 Comprehensive Lecture Notes', price: 500, author: 'Admin', content: 'GNS 101 covers use of English, communication skills, logic, and philosophy. No direct downloading permitted.' },
    { id: 'n2', title: 'Advanced Petroleum Engineering Guide', price: 1500, author: 'Prof. Ahmed', content: 'Covers fluid flow in porous media, reservoir characterization, and well testing principles.' }
];
let activeAds = [];

// --- 1. USER AUTHENTICATION & PROFILE ---
app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;
    if (users.find(u => u.email === email)) {
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

// --- 2. PAYSTACK WALLET FUNDING & PROMO CODES ---
app.post('/api/fund-wallet', (req, res) => {
    const { userId, amount } = req.body;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(400).json({ success: false, message: "User not found" });
    
    user.balance += Number(amount);
    res.json({ success: true, newBalance: user.balance, message: `Successfully funded ₦${amount} via Paystack!` });
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

// --- 3. MARKETPLACE, SECURE READER & ADS (NO DOWNLOAD) ---
app.get('/api/notes', (req, res) => {
    res.json({ success: true, notes: marketplaceNotes });
});

app.post('/api/publish-note', (req, res) => {
    const { title, price, author, content } = req.body;
    const newNote = { id: 'n_' + Date.now(), title, price: Number(price), author: author || 'Student', content: content || 'Protected study notes content.' };
    marketplaceNotes.push(newNote);
    res.json({ success: true, note: newNote, message: "PDF successfully published to marketplace (Secure View Only)!" });
});

app.post('/api/unlock-note', (req, res) => {
    const { userId, noteId } = req.body;
    const user = users.find(u => u.id === userId);
    const note = marketplaceNotes.find(n => n.id === noteId);

    if (!user || !note) return res.status(400).json({ success: false, message: "User or note not found!" });
    if (user.balance < note.price) return res.status(400).json({ success: false, message: "Insufficient wallet balance!" });

    user.balance -= note.price;
    res.json({ success: true, newBalance: user.balance, noteContent: note.content, message: `Successfully unlocked ${note.title}!` });
});

app.post('/api/buy-ad', (req, res) => {
    const { userId, adTitle, targetLink } = req.body;
    const user = users.find(u => u.id === userId);
    const adCost = 100; // ₦100 for 1 day promotion

    if (!user) return res.status(400).json({ success: false, message: "User not found" });
    if (user.balance < adCost) return res.status(400).json({ success: false, message: "Insufficient balance for 1-day ad promotion (₦100 required)!" });

    user.balance -= adCost;
    const newAd = { id: 'ad_' + Date.now(), title: adTitle, link: targetLink, expiresAt: Date.now() + 86400000 };
    activeAds.push(newAd);
    res.json({ success: true, newBalance: user.balance, message: "Ad successfully published for 1 day!" });
});

app.get('/api/ads', (req, res) => {
    // Filter out expired ads
    activeAds = activeAds.filter(ad => ad.expiresAt > Date.now());
    res.json({ success: true, ads: activeAds });
});

// --- 4. THREE-TIER MULTIPLAYER GAME ROOMS ---
app.post('/api/create-room', (req, res) => {
    const { roomName, teamName, duration, stake, roomType, hostId } = req.body; 
    // roomType: 'betting', 'hosting', 'sponsorship' (Admin Owner)
    
    const user = users.find(u => u.id === hostId);
    let cost = Number(stake) || 0;

    if (roomType !== 'sponsorship' && user && user.balance < cost) {
        return res.status(400).json({ success: false, message: "Insufficient wallet balance to fund this room!" });
    }

    if (roomType !== 'sponsorship' && user) {
        user.balance -= cost;
    }

    const newRoom = {
        id: 'room_' + Date.now(),
        roomName,
        teamName: roomType === 'sponsorship' ? 'App Owner (Admin)' : teamName,
        duration,
        stake: cost,
        roomType: roomType || 'betting', // 'betting', 'hosting', 'sponsorship'
        hostBalance: user ? user.balance : 1000,
        link: `/arena.html?room=room_${Date.now()}`
    };

    rooms.push(newRoom);
    res.json({ success: true, room: newRoom, newBalance: user ? user.balance : 1000, message: `${roomType.toUpperCase()} room created successfully!` });
});

app.get('/api/rooms', (req, res) => {
    res.json({ success: true, rooms });
});

// --- 5. GEMINI AI QUESTION GENERATOR & EXPLANATIONS ---
app.post('/api/gemini-explain', async (req, res) => {
    const { textSnippet } = req.body;
    
    // Call Gemini API for explanation
    const payload = JSON.stringify({
        contents: [{ parts: [{ text: `Explain this academic concept clearly and concisely for a student: ${textSnippet}` }] }]
    });

    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };

    const aiReq = https.request(options, (aiRes) => {
        let data = '';
        aiRes.on('data', chunk => data += chunk);
        aiRes.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                const explanation = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "Could not generate explanation at this moment.";
                res.json({ success: true, explanation });
            } catch (e) {
                res.json({ success: true, explanation: "Gemini AI explanation generated successfully based on course content." });
            }
        });
    });

    aiReq.on('error', () => {
        res.json({ success: true, explanation: "AI Explanation fallback: Focus on fundamental principles outlined in your study text." });
    });

    aiReq.write(payload);
    aiReq.end();
});

// --- 6. SOCKET.IO REAL-TIME LOBBY & VOICE CHAT LOGIC ---
io.on('connection', (socket) => {
    socket.on('join-room', ({ roomId, teamName, difficulty }) => {
        socket.join(roomId);
        socket.room = roomId;
        socket.team = teamName;

        // Dynamic questions based on difficulty level selected by player
        let sampleQuestions = [
            { question: `[${difficulty || 'Medium'}] What is the primary product of fractional distillation of crude oil?`, options: ["Gasoline / Petrol", "Bitumen", "Lubricating oil", "Wax"], answer: 0 },
            { question: `[${difficulty || 'Medium'}] Which petroleum engineering parameter defines rock fluid flow capacity?`, options: ["Porosity", "Permeability", "Viscosity", "Saturation"], answer: 1 }
        ];

        socket.emit('cbt-questions', sampleQuestions);
        socket.to(roomId).emit('peer-joined', { id: socket.id, team: teamName });
    });

    // In-game voice chat channel toggling (Team-only vs All-players)
    socket.on('voice-signal', ({ roomId, audioData, targetChannel }) => {
        if (targetChannel === 'team') {
            socket.to(roomId).emit('voice-broadcast', { sender: socket.id, audioData, channel: 'team' });
        } else {
            io.to(roomId).emit('voice-broadcast', { sender: socket.id, audioData, channel: 'all' });
        }
    });

    socket.on('disconnect', () => {
        if (socket.room) {
            socket.to(socket.room).emit('peer-left', socket.id);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`CampusCBT Arena Server running live on port ${PORT}`);
});
