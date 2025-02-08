const mongoose = require("mongoose");
const moment = require("moment");

// Sequence Schema
const sequenceSchema = new mongoose.Schema({
  seqName: { type: String, required: true, unique: true },
  seqValue: { type: Number, default: 0 },
});

const Sequence = mongoose.model("Sequence", sequenceSchema);

// Function to generate unique User ID based on role
async function getNextUserId(role) {
  if (!role) {
    throw new Error("Role is required to generate userId");
  }

  // Role Prefix Mapping
  const prefixMap = {
    Admin: "ADM",
    Employee: "EMP",
    Instructor: "INST",
    HR: "HR",
    Manager: "MNG",
  };

  const prefix = prefixMap[role] || "USR"; // Default to "USR" if role is not found

  try {
    // Increment the sequence counter for the given role
    const sequenceDoc = await Sequence.findOneAndUpdate(
      { seqName: role },
      { $inc: { seqValue: 1 } },
      { new: true, upsert: true }
    );

    const sequenceNumber = sequenceDoc.seqValue.toString().padStart(4, "0"); // Format: 0001, 0002
    return `${prefix}-${sequenceNumber}`; // Example: EMP-0001, MNG-0002
  } catch (error) {
    throw new Error("Error generating user ID: " + error.message);
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  userId: { type: String }, // Automatically generated based on role
  firstName: { type: String },
  lastName: { type: String },
  phoneNumber: { type: String },
  address: { type: String },
  email: { type: String },
  password: { type: String },
  currentOtp: { type: String },
  status: { type: String, default: "Active" },
  roles: { type: mongoose.Schema.Types.ObjectId, ref: "Role" }, // Reference to Role
  image: { type: String },
  files: [String], // Array of document URLs
  createdAt: { type: String, default: () => moment().format("DD-MM-YYYY HH:mm") },
  updatedAt: { type: String, default: () => moment().format("DD-MM-YYYY HH:mm") },
});

// Middleware to generate userId based on role before saving
userSchema.pre("save", async function (next) {
  try {
    if (!this.userId && this.roles) {
      // Fetch the role name from Role model
      const role = await mongoose.model("Role").findById(this.roles);
      if (role && role.roles) {
        this.userId = await getNextUserId(role.roles); // Generate based on role name
      } else {
        return next(new Error("Invalid Role ID"));
      }
    }
    this.updatedAt = moment().format("DD-MM-YYYY HH:mm");
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware to update `updatedAt` before updates
userSchema.pre(["findOneAndUpdate", "updateMany"], function (next) {
  this.set({ updatedAt: moment().format("DD-MM-YYYY HH:mm") });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = { User, Sequence };
