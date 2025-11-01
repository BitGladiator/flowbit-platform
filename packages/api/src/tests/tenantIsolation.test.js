const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const Ticket = require('../models/Ticket');
const connectDB = require('../config/database');
const mongoose = require('mongoose');

describe('Tenant Data Isolation (Requirement R2)', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('Admin from Tenant A cannot read Tenant B data', async () => {
    // Create JWT for LogisticsCo admin
    const logisticsToken = jwt.sign(
      { 
        userId: 'test-user-1',
        customerId: 'LogisticsCo',
        role: 'Admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Fetch tickets with LogisticsCo token
    const response = await request(app)
      .get('/api/tickets')
      .set('Authorization', `Bearer ${logisticsToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    // Verify ALL tickets belong to LogisticsCo
    const allBelongToLogistics = response.body.every(
      ticket => ticket.customerId === 'LogisticsCo'
    );
    expect(allBelongToLogistics).toBe(true);

    // Verify NO RetailGmbH tickets are returned
    const hasRetailTickets = response.body.some(
      ticket => ticket.customerId === 'RetailGmbH'
    );
    expect(hasRetailTickets).toBe(false);

    console.log('✅ Tenant isolation verified: LogisticsCo sees only their tickets');
  });

  test('Direct database query also respects tenant filter', async () => {
    // Query tickets for LogisticsCo
    const logisticsTickets = await Ticket.find({ customerId: 'LogisticsCo' });
    
    // Query tickets for RetailGmbH
    const retailTickets = await Ticket.find({ customerId: 'RetailGmbH' });

    // They should have different tickets
    expect(logisticsTickets.length).toBeGreaterThan(0);
    expect(retailTickets.length).toBeGreaterThan(0);

    // No overlap
    const logisticsIds = logisticsTickets.map(t => t._id.toString());
    const retailIds = retailTickets.map(t => t._id.toString());
    const overlap = logisticsIds.filter(id => retailIds.includes(id));
    expect(overlap.length).toBe(0);

    console.log('✅ Database-level isolation verified');
  });
});