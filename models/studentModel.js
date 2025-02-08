const mongoose = require("mongoose");
const moment = require("moment");

// Sequence Schema
const sequenceSchema = new mongoose.Schema({
  seqName: { type: String, required: true, unique: true },
  seqValue: { type: Number, default: 0 },
});

const SeqStudent = mongoose.model("SeqStudent", sequenceSchema);

// Student Schema
const studentSchema = new mongoose.Schema({
  studentId: { type: String, unique: true }, // ID will be set when creating a new student
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
  roles: { type: String, default: "Students" },
  applicationNumber: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  mobile: { type: String },
  gender: { type: String },
  registrationNumber: { type: String },
  fatherHusbandName: { type: String },
  motherName: { type: String },
  dateOfBirth: { type: String },
  category: { type: String },
  maritalStatus: { type: String },
  educationalQualification: { type: String },
  educationalQualificationDivision: { type: String },
  intermediateDetails: { type: String },
  intermediateDetailsDivision: { type: String },
  highSchoolDetails: { type: String },
  highSchoolDetailsDivision: { type: String },
  presentStreet: { type: String },
  presentHouseNo: { type: String },
  presentVillage: { type: String },
  presentCity: { type: String },
  presentPostOffice: { type: String },
  presentState: { type: String },
  presentDistrict: { type: String },
  presentPincode: { type: String },
  permanentStreet: { type: String },
  permanentHouseNo: { type: String },
  permanentVillage: { type: String },
  permanentCity: { type: String },
  permanentPostOffice: { type: String },
  permanentState: { type: String },
  permanentDistrict: { type: String },
  permanentPincode: { type: String },
  paymentStatus: { type: String },
  paymentId: { type: String },
  applicationFee: { type: String },
  applyFor: { type: String },
  signatureImage: { type: String },
  profileImage: { type: String },
  status: { type: String, default: "Active" },
  createdAt: { type: String, default: () => moment().format("DD-MM-YYYY HH:mm") },
  updatedAt: { type: String, default: () => moment().format("DD-MM-YYYY HH:mm") },
});

// Middleware to generate studentId before creating a new student
studentSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      // Fetch and increment the sequence counter
      const sequenceDoc = await SeqStudent.findOneAndUpdate(
        { seqName: "studentId" }, // Use a common name for student sequence
        { $inc: { seqValue: 1 } },
        { new: true, upsert: true }
      );

      const sequenceValue = sequenceDoc.seqValue.toString().padStart(4, "0"); // Ensure 4-digit sequence
      this.studentId = `SDTS-${sequenceValue}`; // Set the studentId
      next();
    } catch (error) {
      next(error); // Handle error
    }
  } else {
    next();
  }
});

// Middleware to update `updatedAt` before each update operation
studentSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: moment().format("DD-MM-YYYY HH:mm") });
  next();
});

// Middleware to update `updatedAt` field before each updateMany operation
studentSchema.pre("updateMany", function (next) {
  this.set({ updatedAt: moment().format("DD-MM-YYYY HH:mm") });
  next();
});

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
