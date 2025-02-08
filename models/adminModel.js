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


  // Middleware to update `updatedAt` field before each save
  adminSchema.pre("save", function (next) {
    this.updatedAt = moment().format("DD-MM-YYYY HH:mm");
    next();
  });
  
  // Middleware to update `updatedAt` field before each update
  adminSchema.pre("findOneAndUpdate", function (next) {
    this.set({ updatedAt: moment().format("DD-MM-YYYY HH:mm") });
    next();
  });
  
  // Middleware to update `updatedAt` field before each updateMany
  adminSchema.pre("updateMany", function (next) {
    this.set({ updatedAt: moment().format("DD-MM-YYYY HH:mm") });
    next();
  });
  
const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
