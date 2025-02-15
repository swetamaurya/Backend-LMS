const mongoose = require("mongoose");
const moment = require('moment');

const courseSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  status: { type: String , default: "Active" },
  duration: { type: String }, // Duration in days
  category:{ type: mongoose.Schema.Types.ObjectId, ref: "courseCategory" },
  instructor:{ type: mongoose.Schema.Types.ObjectId, ref: "User" },
  thumbnail: { type: String },
  createdBy: { type: String },
  statusOfCards: { type: String }, //store as draft or published
  gallery: [{ type: String }],
  materials: [{ type: String }], // Array for other materials
  createdAt: {
    type: String,
    default: () => moment().format("DD-MM-YYYY HH:mm"),
  },
  updatedAt: {
    type: String,
    default: () => moment().format("DD-MM-YYYY HH:mm"),
  },});


  // Middleware to update `updatedAt` field before each save
courseSchema.pre("save", function (next) {
  this.updatedAt = moment().format("DD-MM-YYYY HH:mm");
  next();
});

// Middleware to update `updatedAt` field before each update
courseSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: moment().format("DD-MM-YYYY HH:mm") });
  next();
});

// Middleware to update `updatedAt` field before each updateMany
courseSchema.pre("updateMany", function (next) {
  this.set({ updatedAt: moment().format("DD-MM-YYYY HH:mm") });
  next();
});

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;


 
 