const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
    index: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastMessage: {
    type: String
  },
  lastMessageAt: {
    type: Date
  }
}, {
  timestamps: true
});

conversationSchema.index({ customerId: 1, participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);