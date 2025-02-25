const mongoose = require("mongoose");
const moment = require("moment");
 

// Role Schema
const roleSchema = new mongoose.Schema({
  roleId: { type: String }, // Automatically generated ID
  roles: { type: String  }, // Use 'roles' field for role name
  status: { type: String, default: "Active" },
  permissions :[String],
  name: { type: mongoose.Schema.Types.ObjectId, ref: "User" ,default :null},
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
  roleSchema.pre("save", function (next) {
    this.updatedAt = moment().format("DD-MM-YYYY HH:mm");
    next();
  });
  
  // Middleware to update `updatedAt` field before each update
  roleSchema.pre("findOneAndUpdate", function (next) {
    this.set({ updatedAt: moment().format("DD-MM-YYYY HH:mm") });
    next();
  });
  
  // Middleware to update `updatedAt` field before each updateMany
  roleSchema.pre("updateMany", function (next) {
    this.set({ updatedAt: moment().format("DD-MM-YYYY HH:mm") });
    next();
  });

  
 

const Role = mongoose.model("Role", roleSchema);

module.exports = Role 
