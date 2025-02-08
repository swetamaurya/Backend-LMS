const mongoose = require("mongoose");
const moment = require('moment');

const courseCategorySchema = new mongoose.Schema({
  categoryName: { type: String },
  status: { type: String , default: "Active" },

  createdAt: {
    type: String,
    default: () => moment().format("DD-MM-YYYY HH:mm"),
  },
  updatedAt: {
    type: String,
    default: () => moment().format("DD-MM-YYYY HH:mm"),
  },});


  // Middleware to update `updatedAt` field before each save
  courseCategorySchema.pre("save", function (next) {
  this.updatedAt = moment().format("DD-MM-YYYY HH:mm");
  next();
});

// Middleware to update `updatedAt` field before each update
courseCategorySchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: moment().format("DD-MM-YYYY HH:mm") });
  next();
});

// Middleware to update `updatedAt` field before each updateMany
courseCategorySchema.pre("updateMany", function (next) {
  this.set({ updatedAt: moment().format("DD-MM-YYYY HH:mm") });
  next();
});

const courseCategory = mongoose.model("courseCategory", courseCategorySchema);
module.exports = courseCategory;