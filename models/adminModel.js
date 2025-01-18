const mongoose = require('mongoose');
const moment = require('moment');

// Admin Schema
const adminSchema = new mongoose.Schema({
  name: { type: String  },
  email: { type: String  },
  password: { type: String  },
  mobile: { type: String },
  roles:  { type: String },
  permissions: [String], // Array of specific permissions
  image: { type: String },
  coverImg: { type: String },
  address: { type: String },
  currentOtp : { type: String },
  createdAt: {
    type: String,
    default: () => moment().format("DD-MM-YYYY HH:mm"),
  },
  updatedAt: {
    type: String,
    default: () => moment().format("DD-MM-YYYY HH:mm"),
  },
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
