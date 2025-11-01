const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  _id: { 
    type: String, 
    required: true 
  }, // "LogisticsCo", "RetailGmbH"
  name: { 
    type: String, 
    required: true 
  },
  plan: { 
    type: String, 
    enum: ['free', 'pro', 'enterprise'], 
    default: 'free' 
  },
  active: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true  // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Customer', customerSchema);