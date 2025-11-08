const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  customerId: { 
    type: String, 
    required: true, 
    index: true 
  },
  role: { 
    type: String, 
    enum: ['Admin', 'User'], 
    default: 'User' 
  },
  active: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true 
});
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);