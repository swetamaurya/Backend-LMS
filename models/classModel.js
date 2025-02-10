const mongoose = require("mongoose");
const moment = require("moment");

const classSchema = new mongoose.Schema({
  classTitle: { type: String },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
  courseCategory : { type: mongoose.Schema.Types.ObjectId, ref: "courseCategory" },
  course : { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  description: { type: String },
  materials: [{ type: String }],
  fromDate: { type: String },
  toDate: { type: String },
  status: { type: String, default: "Scheduled" },
  schedule: { type: String },
  liveLink: { type: String },
  videoLink: { type: String },
  createdAt: { type: String, default: () => moment().format("DD-MM-YYYY HH:mm") },
  updatedAt: { type: String, default: () => moment().format("DD-MM-YYYY HH:mm") },
});

  // Middleware to update `updatedAt` field before each save
  classSchema.pre("save", function (next) {
    this.updatedAt = moment().format("DD-MM-YYYY HH:mm");
    next();
  });
  
  // Middleware to update `updatedAt` field before each update
  classSchema.pre("findOneAndUpdate", function (next) {
    this.set({ updatedAt: moment().format("DD-MM-YYYY HH:mm") });
    next();
  });
  
  // Middleware to update `updatedAt` field before each updateMany
  classSchema.pre("updateMany", function (next) {
    this.set({ updatedAt: moment().format("DD-MM-YYYY HH:mm") });
    next();
  });
  
const Class = mongoose.model("Class", classSchema);
module.exports = Class;


 