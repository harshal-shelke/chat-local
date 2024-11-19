const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Message = require('./models/Messaga');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);


// Serve static files (optional frontend integration)
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error(err));


// Socket.io logic
io.on('connection', (socket) => {

    socket.on('joinRoom', ({ latitude, longitude }) => {
        const roomName = `${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
        socket.join(roomName);

        // Load last 10 messages for the room
        Message.find({ room: roomName })
            .sort({ timestamp: -1 })
            .limit(10)
            .then((messages) => {
                socket.emit('loadMessages', messages.reverse());
            });
    });

    socket.on('sendMessage', async ({ room, username, text }) => {
        const message = new Message({ room, username, text });
        await message.save();
        io.to(room).emit('receiveMessage', message);
    });

    socket.on('disconnect', () => {
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
