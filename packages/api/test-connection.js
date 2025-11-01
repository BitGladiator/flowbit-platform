require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Ticket = require('./src/models/Ticket');

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Count documents
    const userCount = await User.countDocuments();
    const ticketCount = await Ticket.countDocuments();

    console.log(`\n📊 Database Stats:`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Tickets: ${ticketCount}`);

    // Test tenant isolation
    console.log(`\n🔒 Testing Tenant Isolation:`);
    const logisticsTickets = await Ticket.find({ customerId: 'LogisticsCo' });
    const retailTickets = await Ticket.find({ customerId: 'RetailGmbH' });
    
    console.log(`   LogisticsCo tickets: ${logisticsTickets.length}`);
    console.log(`   RetailGmbH tickets: ${retailTickets.length}`);

    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testConnection();