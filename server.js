const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// In-memory storage (use Redis in production)
const rooms = new Map();
const requests = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join/Create room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.roomId = roomId;
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { requests: [], members: 0 });
    }
    
    rooms.get(roomId).members++;
    socket.to(roomId).emit('member-joined', { memberCount: rooms.get(roomId).members });
    socket.emit('room-joined', { roomId, requests: rooms.get(roomId).requests });
  });

  // Real-time request broadcasting
  socket.on('send-request', async (data) => {
    const { roomId, request } = data;
    const requestId = uuidv4();
    
    // Store request
    if (!rooms.has(roomId)) rooms.set(roomId, { requests: [] });
    const room = rooms.get(roomId);
    room.requests.unshift({ id: requestId, ...request, timestamp: new Date() });
    
    // Broadcast to room
    socket.to(roomId).emit('new-request', { id: requestId, ...request });
    
    try {
      // Execute request
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body ? JSON.stringify(request.body) : undefined,
      });
      
      const responseData = {
        id: requestId,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: await response.text(),
        time: Date.now()
      };
      
      // Broadcast response
      io.to(roomId).emit('request-response', responseData);
      
    } catch (error) {
      io.to(roomId).emit('request-error', {
        id: requestId,
        error: error.message
      });
    }
  });

  socket.on('disconnect', () => {
    if (socket.roomId && rooms.has(socket.roomId)) {
      const room = rooms.get(socket.roomId);
      room.members--;
      if (room.members <= 0) {
        rooms.delete(socket.roomId);
      } else {
        socket.to(socket.roomId).emit('member-left', { memberCount: room.members });
      }
    }
  });
});

// API Routes
app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  res.json(rooms.get(roomId) || { requests: [], members: 0 });
});

// Add this route before server.listen()
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/create-room', (req, res) => {
  const roomId = uuidv4().slice(0, 8);
  rooms.set(roomId, { requests: [], members: 0 });
  res.json({ roomId });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 APIForge Backend running on port ${PORT}`);
});