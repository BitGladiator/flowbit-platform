require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Connect to database
    await connectDB();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`\n🚀 Flowbit API Server`);
      console.log(`   Port: ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Database: ${process.env.MONGO_URI}`);
      console.log(`\n📡 API Routes:`);
      console.log(`   POST   http://localhost:${PORT}/api/auth/login`);
      console.log(`   POST   http://localhost:${PORT}/api/auth/register`);
      console.log(`   GET    http://localhost:${PORT}/api/me/screens`);
      console.log(`   GET    http://localhost:${PORT}/api/me/profile`);
      console.log(`   GET    http://localhost:${PORT}/api/tickets`);
      console.log(`   POST   http://localhost:${PORT}/api/tickets`);
      console.log(`   POST   http://localhost:${PORT}/api/webhook/ticket-done`);
      console.log(`   GET    http://localhost:${PORT}/health`);
      console.log(`\n✅ Server is ready!\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();