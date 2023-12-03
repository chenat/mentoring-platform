require('dotenv').config(); // Load environment variables from the .env file

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "https://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, 'public')));

// MongoDB setup
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let db;

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    db = client.db("mentor-student"); 
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  }
}

connectToMongoDB();

app.use((req, res, next) => {
  if (!db) {
    return res.status(500).json({ error: 'MongoDB not connected yet' });
  }
  next();
});

app.get('/api/codeBlock', async (req, res) => {
  const blockName = req.query.block;
  let blockId;

  // Switch case to map block names to MongoDB IDs
  switch (blockName) {
    case 'asyncCase':
      blockId = '656bfc56911d5479c7e7e1e9';
      break;
    case 'bubbleSortCase':
      blockId = '656bfc92911d5479c7e7ebcb';
      break;
    case 'josephusCase':
      blockId = '656bfca6911d5479c7e7efc3';
      break;
    case 'insertionSortCase':
      blockId = '656bfcb7911d5479c7e7f266';
      break;
    default:
      return res.status(404).json({ error: 'Invalid block name' });
  }  const userRole = req.query.role; 
  console.log('blockId:', blockId);
  console.log('userRole:', userRole);

  try {
    const collection = db.collection('codeBlocks');
    const codeBlock = await collection.findOne({ _id: new ObjectId(blockId) });

    if (!codeBlock) {
      return res.status(404).json({ error: 'Code block not found' });
    }

    // Determine user's role and set read-only status
    const isMentor = userRole === 'mentor';
    codeBlock.userRole = userRole; 
    codeBlock.readOnly = isMentor;
    codeBlock.highlighted = isMentor;

    if (userRole === 'mentor') {
      mentorEntered = true;
    }

    res.json({
      ...codeBlock
    });
  } catch (error) {
    console.error('Error fetching code block data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io logic
io.on('connection', (socket) => {
  console.log('A user connected');

  const assignAndEmitRole = () => {
    const userRole = io.sockets.server.engine.clientsCount === 1 ? 'mentor' : 'student';
    socket.emit('role', userRole);
    return userRole;
  };
  
    let userRole = assignAndEmitRole();
  
    socket.on('codeChange', (data) => {
      socket.broadcast.emit('codeChange', data);
    });
  
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  
    socket.on('codeChange', (data) => {
      console.log('Code change received:', data);
      socket.broadcast.emit('codeChange', data);
    });
  
    const handleRoleChange = () => {
      const newRole = assignAndEmitRole();
      userRole = newRole;
      socket.emit('roleChange', newRole); 
    };
  
    socket.on('roleChange', handleRoleChange);
  });

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});