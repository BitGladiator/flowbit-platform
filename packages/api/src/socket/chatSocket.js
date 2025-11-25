const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const userSockets = new Map();

function initializeSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.customerId = decoded.customerId;
      socket.role = decoded.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId} (${socket.customerId})`);
    
    const userKey = `${socket.customerId}:${socket.userId}`;
    userSockets.set(userKey, socket.id);

    socket.join(`customer:${socket.customerId}`);
    socket.join(`user:${socket.userId}`);

    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, receiverId } = data;

        const conversation = await Conversation.findOne({
          _id: conversationId,
          customerId: socket.customerId,
          participants: socket.userId
        });

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        const message = await Message.create({
          customerId: socket.customerId,
          senderId: socket.userId,
          receiverId,
          conversationId,
          content
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: content,
          lastMessageAt: new Date()
        });

        const populatedMessage = await Message.findById(message._id)
          .populate('senderId', 'firstName lastName email')
          .populate('receiverId', 'firstName lastName email');

        socket.emit('message_sent', populatedMessage);

        io.to(`user:${receiverId}`).emit('new_message', populatedMessage);

        const receiverKey = `${socket.customerId}:${receiverId}`;
        const receiverSocketId = userSockets.get(receiverKey);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('conversation_updated', {
            conversationId,
            lastMessage: content,
            lastMessageAt: new Date()
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', (data) => {
      const { conversationId, receiverId } = data;
      io.to(`user:${receiverId}`).emit('user_typing', {
        conversationId,
        userId: socket.userId
      });
    });

    socket.on('stop_typing', (data) => {
      const { conversationId, receiverId } = data;
      io.to(`user:${receiverId}`).emit('user_stop_typing', {
        conversationId,
        userId: socket.userId
      });
    });

    socket.on('mark_as_read', async (data) => {
      try {
        const { messageId } = data;

        const message = await Message.findOneAndUpdate(
          {
            _id: messageId,
            customerId: socket.customerId,
            receiverId: socket.userId
          },
          {
            read: true,
            readAt: new Date()
          },
          { new: true }
        );

        if (message) {
          io.to(`user:${message.senderId}`).emit('message_read', {
            messageId,
            readAt: message.readAt
          });
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      const userKey = `${socket.customerId}:${socket.userId}`;
      userSockets.delete(userKey);
    });
  });
}

module.exports = { initializeSocket };