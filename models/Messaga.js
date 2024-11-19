const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    room: String,         // Location-based room identifier
    username: String,     // User's name
    text: String,         // Message content
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
