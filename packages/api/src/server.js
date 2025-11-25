require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/database');
const { initializeSocket } = require('./socket/chatSocket');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await connectDB();

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: ['http://localhost:3000', 'http://localhost:3002'],
        credentials: true
      }
    });

    initializeSocket(io);

    server.listen(PORT, () => {
      console.log(`\nFlowbit API Server`);
      console.log(`   Port: ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Database: ${process.env.MONGO_URI}`);
      console.log(`\nAPI Routes:`);
      console.log(`   POST   http://localhost:${PORT}/api/auth/login`);
      console.log(`   POST   http://localhost:${PORT}/api/auth/register`);
      console.log(`   GET    http://localhost:${PORT}/api/me/screens`);
      console.log(`   GET    http://localhost:${PORT}/api/me/profile`);
      console.log(`   GET    http://localhost:${PORT}/api/tickets`);
      console.log(`   POST   http://localhost:${PORT}/api/tickets`);
      console.log(`   GET    http://localhost:${PORT}/api/messages/conversations`);
      console.log(`   POST   http://localhost:${PORT}/api/webhook/ticket-done`);
      console.log(`   GET    http://localhost:${PORT}/health`);
      console.log(`\nWebSocket Server:`);
      console.log(`   Socket.io listening on port ${PORT}`);
      console.log(`\nServer is ready!\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();