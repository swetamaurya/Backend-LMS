const mongoose = require("mongoose");
const moment = require("moment");

// Sequence Schema for auto-increment functionality
const seqSchema = new mongoose.Schema({
  seqName: { type: String, required: true, unique: true },
  seqValue: { type: Number, default: 0 },
});

const Seq = mongoose.model("Seq", seqSchema);

// Function to get the next sequence value for batchId
async function getNextSeqValue(type) {
  try {
    const seqDoc = await Seq.findOneAndUpdate(
      { seqName: type },
      { $inc: { seqValue: 1 } },
      { new: true, upsert: true }
    );

    const seqNumber = seqDoc.seqValue.toString().padStart(4, "0");
    return `${type}-${seqNumber}`;
  } catch (error) {
    throw new Error("Error generating sequence value: " + error.message);
  }
}

// Batch Schema
const batchSchema = new mongoose.Schema({
  batchTitle: { type: String },
  batchId: { type: String,   }, // Unique batchId
  batchYear: { type: String },
  durationFrom: { type: String },
  durationTo: { type: String },
  totalDays: { type: String },
  status: { type: String, default: "Active" },
  batchCategory: [{ type: mongoose.Schema.Types.ObjectId, ref: "BatchCategory" }],
  createdAt: { type: String, default: () => moment().format("DD-MM-YYYY HH:mm") },
  updatedAt: { type: String, default: () => moment().format("DD-MM-YYYY HH:mm") },
});

// Middleware to auto-generate batchId and update timestamps
batchSchema.pre("save", async function (next) {
  if (!this.batchId) {
    try {
      this.batchId = await getNextSeqValue("BATCH");
    } catch (error) {
      return next(error);
    }
  }
  this.updatedAt = moment().format("DD-MM-YYYY HH:mm");
  next();
});

// Middleware to update `updatedAt` before each update operation
batchSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: moment().format("DD-MM-YYYY HH:mm") });
  next();
});

// Middleware to update `updatedAt` field before each updateMany operation
batchSchema.pre("updateMany", function (next) {
  this.set({ updatedAt: moment().format("DD-MM-YYYY HH:mm") });
  next();
});

const Batch = mongoose.model("Batch", batchSchema);
module.exports = Batch;
