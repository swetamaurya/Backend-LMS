const mongoose = require("mongoose");
const moment = require("moment");
const { permission } = require("process");

// Sequence Schema
const sequenceSchema = new mongoose.Schema({
  seqName: { type: String, required: true, unique: true },
  seqValue: { type: Number, default: 0 },
});

const Sequence = mongoose.model("Sequence", sequenceSchema);

// Function to get the next sequence value for roleId
async function getNextSequenceValue(type) {
  const prefixMap = {
    Admin: "ADM",
    Employee: "EMP",
    Instructor: "INST",
    Students: "SDTS",
    HR: "HR",
    Manager: "MNG",
  };

  const prefix = prefixMap[type] || "USR";

  try {
    const sequenceDoc = await Sequence.findOneAndUpdate(
      { seqName: type },
      { $inc: { seqValue: 1 } },
      { new: true, upsert: true }
    );

    const sequenceNumber = sequenceDoc.seqValue.toString().padStart(4, "0");
    return `${prefix}-${sequenceNumber}`;
  } catch (error) {
    throw new Error("Error generating sequence value: " + error.message);
  }
}

// Role Schema
const roleSchema = new mongoose.Schema({
  roleId: { type: String }, // Automatically generated ID
  roles: { type: String  }, // Use 'roles' field for role name
  status: { type: String, default: "Active" },
  permission :[String],
  // name : { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: {
    type: String,
    default: () => moment().format("DD-MM-YYYY HH:mm"),
  },
  updatedAt: {
    type: String,
    default: () => moment().format("DD-MM-YYYY HH:mm"),
  },
});

// Pre-save hook to generate roleId and update timestamps
roleSchema.pre("save", async function (next) {
  try {
    if (!this.roleId && this.roles) {
      this.roleId = await getNextSequenceValue(this.roles); // Use 'roles' to generate ID
    } else if (!this.roles) {
      return next(new Error("Roles is required to generate roleId"));
    }
    this.updatedAt = moment().format("DD-MM-YYYY HH:mm");
    next();
  } catch (error) {
    next(error);
  }
});

const Role = mongoose.model("Role", roleSchema);

module.exports = { Role, Sequence };
