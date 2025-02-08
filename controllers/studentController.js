const Student = require("../models/studentModel");
const { uploadFileToFirebase , bucket} = require('../utils/fireBase');

 
// // ================================================================================================
// // ================================================================================================
// Create a course
exports.createStudent = async (req, res) => {
    try {
      // Initialize course data from req.body
      const studentData = { ...req.body };
  
      let signatureImageUrl = "";
      let profileImageUrl = "";


      // Handle single file upload for signatureImage
      if (req.files?.signatureImage) {
        const uploadedSignatureImage = await uploadFileToFirebase(req.files.signatureImage);
        signatureImageUrl = uploadedSignatureImage[0]; 
        studentData.signatureImage = signatureImageUrl; 
      }

      // Handle single file upload for profileImage
      if (req.files?.profileImage) {
        const uploadedThumbnail = await uploadFileToFirebase(req.files.profileImage);
        profileImageUrl = uploadedThumbnail[0]; 
        studentData.profileImage = profileImageUrl; 
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
      const { page, limit} = req.query; // Default page = 1, limit = 10
  
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

    let signatureImageUrl = existingStudent.signatureImage || "";
    let profileImageUrl = existingStudent.profileImage || "";

    // Handle single image upload for signature image
    if (req.files?.signatureImage) {
      const uploadedSignatureImage = await uploadFileToFirebase(req.files.signatureImage);
      signatureImageUrl = uploadedSignatureImage[0]; // Replace thumbnail with the new one
    }
    // Handle single image upload for profile image
    if (req.files?.profileImage) {
      const uploadedSignatureImage = await uploadFileToFirebase(req.files.profileImage);
      profileImageUrl = uploadedSignatureImage[0]; // Replace thumbnail with the new one
    }

    // Add updated file URLs to update fields
    updateFields.signatureImage = signatureImageUrl;
    updateFields.profileImage = profileImageUrl;

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

  
  