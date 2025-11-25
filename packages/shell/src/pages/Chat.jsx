import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import socketService from '../services/socket';

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [users, setUsers] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    fetchUsers();

    socketService.on('new_message', handleNewMessage);
    socketService.on('conversation_updated', handleConversationUpdated);
    socketService.on('user_typing', handleUserTyping);
    socketService.on('user_stop_typing', handleUserStopTyping);
    socketService.on('message_read', handleMessageRead);

    return () => {
      socketService.off('new_message', handleNewMessage);
      socketService.off('conversation_updated', handleConversationUpdated);
      socketService.off('user_typing', handleUserTyping);
      socketService.off('user_stop_typing', handleUserStopTyping);
      socketService.off('message_read', handleMessageRead);
    };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/messages/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/messages/conversations/${conversationId}/messages`);
      setMessages(response.data);
      
      response.data.forEach(msg => {
        if (msg.receiverId._id === user.id && !msg.read) {
          markAsRead(msg._id);
        }
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await api.patch(`/messages/messages/${messageId}/read`);
      socketService.emit('mark_as_read', { messageId });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleNewMessage = (message) => {
    if (selectedConversation && message.conversationId === selectedConversation._id) {
      setMessages(prev => [...prev, message]);
      
      if (message.receiverId._id === user.id) {
        markAsRead(message._id);
      }
    }

    setConversations(prev => {
      const updated = prev.map(conv => {
        if (conv._id === message.conversationId) {
          return {
            ...conv,
            lastMessage: message.content,
            lastMessageAt: message.createdAt,
            unreadCount: message.receiverId._id === user.id ? (conv.unreadCount || 0) + 1 : conv.unreadCount
          };
        }
        return conv;
      });
      
      return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
    });
  };

  const handleConversationUpdated = (data) => {
    setConversations(prev => {
      const updated = prev.map(conv => {
        if (conv._id === data.conversationId) {
          return {
            ...conv,
            lastMessage: data.lastMessage,
            lastMessageAt: data.lastMessageAt
          };
        }
        return conv;
      });
      
      return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
    });
  };

  const handleUserTyping = (data) => {
    if (selectedConversation && data.conversationId === selectedConversation._id) {
      setTyping(data.userId);
    }
  };

  const handleUserStopTyping = (data) => {
    if (selectedConversation && data.conversationId === selectedConversation._id) {
      setTyping(null);
    }
  };

  const handleMessageRead = (data) => {
    setMessages(prev => prev.map(msg => {
      if (msg._id === data.messageId) {
        return { ...msg, read: true, readAt: data.readAt };
      }
      return msg;
    }));
  };

  const startNewConversation = async (userId) => {
    try {
      const response = await api.get(`/messages/conversations/${userId}`);
      setSelectedConversation(response.data);
      setShowNewChat(false);
      
      const existingConv = conversations.find(c => c._id === response.data._id);
      if (!existingConv) {
        setConversations(prev => [response.data, ...prev]);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !selectedConversation) return;

    const otherParticipant = selectedConversation.participants.find(p => p._id !== user.id);
    
    socketService.emit('send_message', {
      conversationId: selectedConversation._id,
      content: messageInput.trim(),
      receiverId: otherParticipant._id
    });

    setMessageInput('');
    
    socketService.emit('stop_typing', {
      conversationId: selectedConversation._id,
      receiverId: otherParticipant._id
    });
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    if (selectedConversation) {
      const otherParticipant = selectedConversation.participants.find(p => p._id !== user.id);
      
      socketService.emit('typing', {
        conversationId: selectedConversation._id,
        receiverId: otherParticipant._id
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socketService.emit('stop_typing', {
          conversationId: selectedConversation._id,
          receiverId: otherParticipant._id
        });
      }, 1000);
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== user.id);
  };

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diff = now - messageDate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return messageDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <LoadingSpinner />
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>
            <ChatIcon />
            Messages
          </h1>
          <p style={styles.subtitle}>
            Chat with {user.role === 'Admin' ? 'team members' : 'administrators'}
          </p>
        </div>
        <button onClick={() => setShowNewChat(true)} style={styles.newChatButton}>
          <PlusIcon />
          New Chat
        </button>
      </div>

      <div style={styles.chatContainer}>
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h3 style={styles.sidebarTitle}>Conversations</h3>
          </div>
          <div style={styles.conversationList}>
            {conversations.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>No conversations yet</p>
              </div>
            ) : (
              conversations.map(conv => {
                const otherUser = getOtherParticipant(conv);
                return (
                  <div
                    key={conv._id}
                    style={{
                      ...styles.conversationItem,
                      ...(selectedConversation?._id === conv._id ? styles.conversationItemActive : {})
                    }}
                    onClick={() => {
                      setSelectedConversation(conv);
                      setConversations(prev => prev.map(c =>
                        c._id === conv._id ? { ...c, unreadCount: 0 } : c
                      ));
                    }}
                  >
                    <div style={styles.conversationAvatar}>
                      {otherUser.firstName[0]}{otherUser.lastName[0]}
                    </div>
                    <div style={styles.conversationInfo}>
                      <div style={styles.conversationHeader}>
                        <span style={styles.conversationName}>
                          {otherUser.firstName} {otherUser.lastName}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span style={styles.unreadBadge}>{conv.unreadCount}</span>
                        )}
                      </div>
                      <span style={styles.conversationRole}>{otherUser.role}</span>
                      {conv.lastMessage && (
                        <p style={styles.conversationLastMessage}>
                          {conv.lastMessage.length > 40
                            ? conv.lastMessage.substring(0, 40) + '...'
                            : conv.lastMessage
                          }
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={styles.chatArea}>
          {selectedConversation ? (
            <>
              <div style={styles.chatHeader}>
                <div style={styles.chatHeaderInfo}>
                  <div style={styles.chatAvatar}>
                    {getOtherParticipant(selectedConversation).firstName[0]}
                    {getOtherParticipant(selectedConversation).lastName[0]}
                  </div>
                  <div>
                    <h3 style={styles.chatHeaderName}>
                      {getOtherParticipant(selectedConversation).firstName}{' '}
                      {getOtherParticipant(selectedConversation).lastName}
                    </h3>
                    <p style={styles.chatHeaderRole}>
                      {getOtherParticipant(selectedConversation).role}
                    </p>
                  </div>
                </div>
              </div>

              <div style={styles.messagesContainer}>
                {messages.map((message) => {
                  const isOwn = message.senderId._id === user.id;
                  return (
                    <div
                      key={message._id}
                      style={{
                        ...styles.messageWrapper,
                        justifyContent: isOwn ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          ...styles.message,
                          ...(isOwn ? styles.messageOwn : styles.messageOther)
                        }}
                      >
                        <p style={styles.messageContent}>{message.content}</p>
                        <div style={styles.messageFooter}>
                          <span style={styles.messageTime}>
                            {formatTime(message.createdAt)}
                          </span>
                          {isOwn && message.read && (
                            <span style={styles.messageRead}>
                              <CheckIcon />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {typing && (
                  <div style={styles.typingIndicator}>
                    <span style={styles.typingText}>Typing</span>
                    <span style={styles.typingDots}>
                      <span>.</span><span>.</span><span>.</span>
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} style={styles.inputContainer}>
                <input
                  type="text"
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  style={styles.input}
                />
                <button type="submit" style={styles.sendButton} disabled={!messageInput.trim()}>
                  <SendIcon />
                </button>
              </form>
            </>
          ) : (
            <div style={styles.emptyChatState}>
              <div style={styles.emptyChatIcon}>
                <ChatBubbleIcon />
              </div>
              <h3 style={styles.emptyChatTitle}>Select a conversation</h3>
              <p style={styles.emptyChatText}>
                Choose a conversation from the list or start a new one
              </p>
            </div>
          )}
        </div>
      </div>

      {showNewChat && (
        <div style={styles.modal} onClick={() => setShowNewChat(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Start New Conversation</h3>
              <button onClick={() => setShowNewChat(false)} style={styles.modalClose}>
                <CloseIcon />
              </button>
            </div>
            <div style={styles.userList}>
              {users.map(u => (
                <div
                  key={u._id}
                  style={styles.userItem}
                  onClick={() => startNewConversation(u._id)}
                >
                  <div style={styles.userAvatar}>
                    {u.firstName[0]}{u.lastName[0]}
                  </div>
                  <div style={styles.userInfo}>
                    <span style={styles.userName}>
                      {u.firstName} {u.lastName}
                    </span>
                    <span style={styles.userRole}>{u.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ChatIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ChatBubbleIcon = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LoadingSpinner = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 18V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)',
    color: '#ffffff',
    padding: '32px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    gap: '16px',
    color: 'rgba(255,255,255,0.7)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    gap: '24px',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: '0 0 8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  subtitle: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.7)',
    margin: 0,
  },
  newChatButton: {
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
  },
  chatContainer: {
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: '24px',
    height: 'calc(100vh - 200px)',
  },
  sidebar: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    padding: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  sidebarTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0,
  },
  conversationList: {
    flex: 1,
    overflow: 'auto',
  },
  conversationItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  conversationItemActive: {
    background: 'rgba(0, 212, 255, 0.1)',
    borderLeft: '3px solid #00d4ff',
  },
  conversationAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(0, 212, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '600',
    color: '#00d4ff',
    flexShrink: 0,
  },
  conversationInfo: {
    flex: 1,
    minWidth: 0,
  },
  conversationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  conversationName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#ffffff',
  },
  conversationRole: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    display: 'block',
    marginBottom: '4px',
  },
  conversationLastMessage: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  unreadBadge: {
    background: '#00d4ff',
    color: '#000',
    borderRadius: '10px',
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: '700',
  },
  chatArea: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  chatHeader: {
    padding: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.02)',
  },
  chatHeaderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  chatAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(0, 212, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '600',
    color: '#00d4ff',
  },
  chatHeaderName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    margin: '0 0 4px 0',
  },
  chatHeaderRole: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
  messagesContainer: {
    flex: 1,
    overflow: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  messageWrapper: {
    display: 'flex',
    width: '100%',
  },
  message: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '12px',
    wordWrap: 'break-word',
  },
  messageOwn: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    color: '#000',
  },
  messageOther: {
    background: 'rgba(255,255,255,0.1)',
    color: '#ffffff',
  },
  messageContent: {
    fontSize: '14px',
    lineHeight: '1.5',
    margin: '0 0 8px 0',
  },
  messageFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },
  messageTime: {
    fontSize: '11px',
    opacity: 0.7,
  },
  messageRead: {
    display: 'flex',
    alignItems: 'center',
  },
  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    maxWidth: '70%',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '12px',
  },
  typingText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
  },
  typingDots: {
    display: 'flex',
    gap: '4px',
  },
  inputContainer: {
    padding: '20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    gap: '12px',
  },
  input: {
    flex: 1,
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#ffffff',
    outline: 'none',
  },
  sendButton: {
    padding: '14px 20px',
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChatState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  emptyChatIcon: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'rgba(0, 212, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#00d4ff',
    marginBottom: '24px',
  },
  emptyChatTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#ffffff',
    margin: '0 0 8px 0',
  },
  emptyChatText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '70vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    padding: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0,
  },
  modalClose: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'rgba(255,255,255,0.7)',
  },
  userList: {
    flex: 1,
    overflow: 'auto',
    padding: '12px',
  },
  userItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    marginBottom: '8px',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(0, 212, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: '#00d4ff',
  },
  userInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#ffffff',
  },
  userRole: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
  },
};

Object.assign(styles.conversationItem, {
  ':hover': {
    background: 'rgba(255,255,255,0.05)',
  },
});

Object.assign(styles.userItem, {
  ':hover': {
    background: 'rgba(255,255,255,0.05)',
  },
});