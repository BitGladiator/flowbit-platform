require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Customer = require('../src/models/Customer');
const User = require('../src/models/User');
const Ticket = require('../src/models/Ticket');

async function seedDatabase() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/flowbit');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Customer.deleteMany({});
    await User.deleteMany({});
    await Ticket.deleteMany({});

    // Create Customers (Tenants)
    console.log('👥 Creating customers...');
    const customers = await Customer.create([
      {
        _id: 'LogisticsCo',
        name: 'Logistics Company Inc.',
        plan: 'enterprise'
      },
      {
        _id: 'RetailGmbH',
        name: 'Retail GmbH',
        plan: 'pro'
      }
    ]);
    console.log('✅ Created 2 customers');

    // Create Users
    console.log('👤 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.create([
      // LogisticsCo users
      {
        email: 'admin@logisticsco.com',
        password: hashedPassword,
        customerId: 'LogisticsCo',
        role: 'Admin'
      },
      {
        email: 'user@logisticsco.com',
        password: hashedPassword,
        customerId: 'LogisticsCo',
        role: 'User'
      },
      // RetailGmbH users
      {
        email: 'admin@retailgmbh.com',
        password: hashedPassword,
        customerId: 'RetailGmbH',
        role: 'Admin'
      },
      {
        email: 'user@retailgmbh.com',
        password: hashedPassword,
        customerId: 'RetailGmbH',
        role: 'User'
      }
    ]);
    console.log('✅ Created 4 users (2 per tenant)');

    // Create Sample Tickets
    console.log('🎫 Creating sample tickets...');
    const tickets = await Ticket.create([
      // LogisticsCo tickets
      {
        customerId: 'LogisticsCo',
        title: 'Shipment tracking not updating',
        description: 'The tracking page shows old information',
        status: 'pending',
        createdBy: users[1]._id, // user@logisticsco.com
        priority: 'high'
      },
      {
        customerId: 'LogisticsCo',
        title: 'Need help with API integration',
        description: 'How do I integrate with the shipping API?',
        status: 'resolved',
        createdBy: users[1]._id,
        priority: 'medium'
      },
      // RetailGmbH tickets
      {
        customerId: 'RetailGmbH',
        title: 'Inventory sync failed',
        description: 'Products not syncing with warehouse system',
        status: 'processing',
        createdBy: users[3]._id, // user@retailgmbh.com
        priority: 'high'
      },
      {
        customerId: 'RetailGmbH',
        title: 'Add new payment method',
        description: 'We need to accept cryptocurrency payments',
        status: 'pending',
        createdBy: users[3]._id,
        priority: 'low'
      }
    ]);
    console.log('✅ Created 4 sample tickets (2 per tenant)');

    // Summary
    console.log('\n📊 Seed Summary:');
    console.log('   Customers: 2 (LogisticsCo, RetailGmbH)');
    console.log('   Users: 4 (1 Admin + 1 User per customer)');
    console.log('   Tickets: 4 (2 per customer)');
    console.log('\n🔑 Test Credentials:');
    console.log('   LogisticsCo Admin: admin@logisticsco.com / password123');
    console.log('   LogisticsCo User:  user@logisticsco.com / password123');
    console.log('   RetailGmbH Admin:  admin@retailgmbh.com / password123');
    console.log('   RetailGmbH User:   user@retailgmbh.com / password123');

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error);
    process.exit(1);
  }
}

seedDatabase();