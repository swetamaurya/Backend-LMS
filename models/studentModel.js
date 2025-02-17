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
  studentId: { type: String, unique: true, sparse: true   }, // ID will be set when creating a new student
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
  roles: { type: String, default: "Students" },
  application_number: { type: String },
  first_name: { type: String },
  last_name: { type: String },
  email: { type: String },
  password: { type: String },
  phone: { type: String },
  gender: { type: String },
  registration_number: { type: String },
  father_husband_name: { type: String },
  mother_name: { type: String },
  date_of_birth: { type: String },
  category: { type: String },
  marital_status: { type: String },
  educational_qualification: { type: String },
  educational_qualification_division: { type: String },
  intermediate_details: { type: String },
  intermediate_details_division: { type: String },
  high_school_details: { type: String },
  high_school_details_division: { type: String },
  present_street: { type: String },
  present_house_no: { type: String },
  present_village: { type: String },
  present_city: { type: String },
  present_post_office: { type: String },
  present_state: { type: String },
  present_district: { type: String },
  present_pincode: { type: String },
  permanent_street: { type: String },
  permanent_house_no: { type: String },
  permanent_village: { type: String },
  permanent_city: { type: String },
  permanent_post_office: { type: String },
  permanent_state: { type: String },
  permanent_district: { type: String },
  permanent_pincode: { type: String },
  payment_status: { type: String },
  paymentId: { type: String },
  applicationFee: { type: String },
  apply_for: { type: String },
  signature_path: { type: String },
  examination_fees: { type: String },
  examination_centre_state: { type: String },
  examination_centre_city: { type: String },
  status : { type: String },
  photo_path: { type: String },
  userStatus: { type: String, default: "Active" },
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
