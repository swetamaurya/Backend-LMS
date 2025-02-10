const Student = require("../models/studentModel");
const { uploadFileToFirebase , bucket} = require('../utils/fireBase');
const axios = require("axios")
 
// // ================================================================================================
// // ================================================================================================
// Create a course
exports.createStudent = async (req, res) => {
    try {
      // Initialize course data from req.body
      const studentData = { ...req.body };
  
      let signature_pathUrl = "";
      let photo_pathUrl = "";


      // Handle single file upload for signature_path
      if (req.files?.signature_path) {
        const uploadedsignature_path = await uploadFileToFirebase(req.files.signature_path);
        signature_pathUrl = uploadedsignature_path[0]; 
        studentData.signature_path = signature_pathUrl; 
      }

      // Handle single file upload for photo_path
      if (req.files?.photo_path) {
        const uploadedThumbnail = await uploadFileToFirebase(req.files.photo_path);
        photo_pathUrl = uploadedThumbnail[0]; 
        studentData.photo_path = photo_pathUrl; 
      }
  
      // Create a new course with the collected data
      const student = new Student(studentData);
      const savedStudent = await student.save();
  
      res.status(200).json({
        message: "Student created successfully",
        course: savedStudent,
      });
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(500).json({ message: "Error creating student", error });
    }
  };
  
  


// // ================================================================================================
// // ================================================================================================
// Get all courses with pagination
exports.getAllStudents = async (req, res) => {
    try {
      const { page , limit} = req.query; // Default page = 1, limit = 10
  
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const totalStudents = await Student.countDocuments();
  
      const students = await Student.find()
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });
  
      res.status(200).json({
        message: "Students fetched successfully!",
        students,
        pagination: {
          totalStudents,
          totalPages: Math.ceil(totalStudents / limit),
          currentPage: parseInt(page),
          pageSize: parseInt(limit),
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching courses", error });
    }
  };
 
  
// // ================================================================================================
// // ================================================================================================
// Get single course
  exports.getStudent = async (req, res) => {
    try {
      const { _id } = req.query;
  console.log(req.query)
  if (!_id) {
    return res.status(400).json({ message: 'Student ID (_id) is required.' });
  }
      const student = await Student.findById(_id).lean();
      if (!student) return res.status(404).json({ message: "Student not found" });
  
      res.status(200).json({ message: "Student fetched successfully!", student });
    } catch (error) {
      res.status(500).json({ message: "Error fetching student", error });
    }
  };
  
//Update Student
exports.updateStudent = async (req, res) => {
  try {
    const { _id, ...updateFields } = req.body;

    // Validate course ID
    if (!_id) {
      return res.status(400).json({ message: "Course ID is required for updating." });
    }

    // Fetch existing course from the database
    const existingStudent = await Student.findById(_id);
    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    let signature_pathUrl = existingStudent.signature_path || "";
    let photo_pathUrl = existingStudent.photo_path || "";

    // Handle single image upload for signature image
    if (req.files?.signature_path) {
      const uploadedsignature_path = await uploadFileToFirebase(req.files.signature_path);
      signature_pathUrl = uploadedsignature_path[0]; // Replace thumbnail with the new one
    }
    // Handle single image upload for profile image
    if (req.files?.photo_path) {
      const uploadedsignature_path = await uploadFileToFirebase(req.files.photo_path);
      photo_pathUrl = uploadedsignature_path[0]; // Replace thumbnail with the new one
    }

    // Add updated file URLs to update fields
    updateFields.signature_path = signature_pathUrl;
    updateFields.photo_path = photo_pathUrl;

    // Update the course in the database
    const updatedStudent = await Student.findByIdAndUpdate(_id, updateFields, {
      new: true, // Return the updated document
    });

    if (!updatedStudent) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({
      message: "Student updated successfully",
      course: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: "Error updating student", error });
  }
};

// student data update
 
exports.studentDataUpdate = async (req, res) => {
  try {
    // Make API request
    const response = await axios.get("https://www.niaaviationservices.com/api/all-users");

    // Extract student list correctly
    const apiStudents = response.data.result; // <-- Fix: Now extracting only student list
    console.log("Total Students from API:", apiStudents.length);

    // Get existing students from MongoDB
    const foundStudents = await Student.find();
    console.log("Existing Students in DB:", foundStudents.length);

    // Compare the counts and find the difference
    if (apiStudents.length > foundStudents.length) {
      let diff = apiStudents.length - foundStudents.length;
      console.log(" New Students to Insert:", diff);

      // Get the last `diff` students from API data
      let newStudents = apiStudents.slice(-diff); // <-- Fix: `apiStudents` is now an array

      console.log(" New Student Data:", newStudents);

      // Insert only if there are new students
      if (newStudents.length > 0) {
        let insertedStudents = await Student.insertMany(newStudents);
        return res.status(200).json({ message: "Students updated successfully", insertedStudents });
      }
    } else {
      return res.status(400).json({ message: "No new students to update" });
    }
  } catch (error) {
    console.error("  Error updating student:", error);
    res.status(500).json({ message: "Error updating student", error: error.message });
  }
};



  
  