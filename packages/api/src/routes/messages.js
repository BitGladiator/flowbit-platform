const express = require('express');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

router.use(authenticateToken);

router.get('/conversations', async (req, res) => {
  try {
    const conversations = await Conversation.find({
      customerId: req.user.customerId,
      participants: req.user.userId
    })
    .populate('participants', 'firstName lastName email role')
    .sort({ lastMessageAt: -1 });

    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id.toString(),
          receiverId: req.user.userId,
          read: false
        });

        return {
          ...conv.toObject(),
          unreadCount
        };
      })
    );

    res.json(conversationsWithUnread);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const otherUser = await User.findOne({
      _id: userId,
      customerId: req.user.customerId
    });

    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const participants = [req.user.userId, userId].sort();
    
    let conversation = await Conversation.findOne({
      customerId: req.user.customerId,
      participants: { $all: participants }
    }).populate('participants', 'firstName lastName email role');

    if (!conversation) {
      conversation = await Conversation.create({
        customerId: req.user.customerId,
        participants,
        lastMessageAt: new Date()
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'firstName lastName email role');
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      customerId: req.user.customerId,
      participants: req.user.userId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const query = {
      conversationId,
      customerId: req.user.customerId
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('senderId', 'firstName lastName email')
      .populate('receiverId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, receiverId } = req.body;

    if (!content || !receiverId) {
      return res.status(400).json({ error: 'Content and receiverId are required' });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      customerId: req.user.customerId,
      participants: req.user.userId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const message = await Message.create({
      customerId: req.user.customerId,
      senderId: req.user.userId,
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

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(400).json({ error: error.message });
  }
});

router.patch('/messages/:messageId/read', async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      {
        _id: req.params.messageId,
        customerId: req.user.customerId,
        receiverId: req.user.userId
      },
      {
        read: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({
      customerId: req.user.customerId,
      _id: { $ne: req.user.userId },
      active: true
    }).select('firstName lastName email role');

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;