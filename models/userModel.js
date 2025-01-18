const mongoose = require('mongoose');
const moment = require('moment');

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  phoneNumber: { type: String },
  address: { type: String },
  email: { type: String },
  password: { type: String },
  currentOtp : { type: String },
  roles: { type: mongoose.Schema.Types.ObjectId, ref: "Role" }, // Reference to Role
  image: { type: String },
  files: [String], // Array of document URLs
  createdAt: { 
    type: String, 
    default: () => moment().format("DD-MM-YYYY HH:mm"),
  },
  updatedAt: { 
    type: String, 
    default: () => moment().format("DD-MM-YYYY HH:mm"),
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
