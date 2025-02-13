const Course = require("../models/courseModel");
const { uploadFileToFirebase , bucket} = require('../utils/fireBase');

 
// // ================================================================================================
// // ================================================================================================
// Create a course
exports.createCourse = async (req, res) => {
    try {
      // Initialize course data from req.body
      const courseData = { ...req.body };
  
      let materialsUrls = [];
      let galleryUrls = []
      let thumbnailUrl = "";
  
      // Handle multiple file uploads for materials
      if (req.files?.materials) {
        materialsUrls = await uploadFileToFirebase(req.files.materials);
        courseData.materials = materialsUrls; // Add file URLs to course data
      }
  

      // Handle multiple file uploads for materials 
      if (req.files?.gallery) {
        galleryUrls = await uploadFileToFirebase(req.files.gallery);
        courseData.gallery = galleryUrls; // Add file URLs to course data
      }


      // Handle single file upload for thumbnail
      if (req.files?.thumbnail) {
        const uploadedThumbnail = await uploadFileToFirebase(req.files.thumbnail);
        thumbnailUrl = uploadedThumbnail[0]; // Use the first uploaded image for thumbnail
        courseData.thumbnail = thumbnailUrl; // Add thumbnail URL to course data
      }
  
      // Create a new course with the collected data
      const course = new Course(courseData);
      const savedCourse = await course.save();
  
      res.status(200).json({
        message: "Course created successfully",
        course: savedCourse,
      });
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Error creating course", error });
    }
  };
  
  
// // ================================================================================================
// // ================================================================================================
// Get all courses with pagination
exports.getAllCourses = async (req, res) => {
    try {
      const { page, limit} = req.query; // Default page = 1, limit = 10
  
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const totalCourses = await Course.countDocuments();
  
      const courses = await Course.find().populate('category instructor')
      .sort({ _id: -1 })
      .skip(skip)
      .limit(parseInt(limit))
   
      res.status(200).json({
        message: "Courses fetched successfully!",
        courses,
        pagination: {
          totalCourses,
          totalPages: Math.ceil(totalCourses / limit),
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
  exports.getCourse = async (req, res) => {
    try {
      const { _id } = req.query;
  console.log(req.query)
  if (!_id) {
    return res.status(400).json({ message: 'Course ID (_id) is required.' });
  }
      const course = await Course.findById(_id).populate('category instructor').lean();
      if (!course) return res.status(404).json({ message: "Course not found" });
  
      res.status(200).json({ message: "Course fetched successfully!", course });
    } catch (error) {
      res.status(500).json({ message: "Error fetching course", error });
    }
  };
  
  
  
// // ================================================================================================
// // ================================================================================================
// Update course
// exports.updateCourse = async (req, res) => {
//     try {
//       const { _id, ...updateFields } = req.body;
//   console.log(req.body)
//       // Validate course ID
//       if (!_id) {
//         return res.status(400).json({ message: "Course ID is required for updating." });
//       }
  
//       let galleryUrl = [];
//       let materialsUrl = [];
//       let thumbnailUrl = "";
  
//       // Handle multiple file uploads for materials
//       if (req.files?.materials) {
//         materialsUrl = await uploadFileToFirebase(req.files.materials);
//         updateFields.materials = materialsUrl; // Add file URLs to update fields
//       }
  
//       // Handle multiple file uploads for gallery
//       if (req.files?.gallery) {
//         galleryUrl = await uploadFileToFirebase(req.files.gallery);
//         updateFields.gallery = galleryUrl; // Add file URLs to update fields
//       }
  
//       // Handle single image upload for thumbnail
//       if (req.files?.thumbnail) {
//         const uploadedThumbnail = await uploadFileToFirebase(req.files.thumbnail);
//         thumbnailUrl = uploadedThumbnail[0];
//         updateFields.thumbnail = thumbnailUrl; // Add thumbnail URL to update fields
//       }
  
//       // Update course
//       const updatedCourse = await Course.findByIdAndUpdate(_id, updateFields, {
//         new: true,
//       });
  
//       if (!updatedCourse)
//         return res.status(404).json({ message: "Course not found" });
  
//       res.status(200).json({
//         message: "Course updated successfully",
//         course: updatedCourse,
//       });
//     } catch (error) {
//       console.error("Error updating course:", error);
//       res.status(500).json({ message: "Error updating course", error });
//     }
//   };

exports.updateCourse = async (req, res) => {
  try {
    const { _id, ...updateFields } = req.body;

    // Validate course ID
    if (!_id) {
      return res.status(400).json({ message: "Course ID is required for updating." });
    }

    // Fetch existing course from the database
    const existingCourse = await Course.findById(_id);
    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    let galleryUrl = existingCourse.gallery || [];
    let materialsUrl = existingCourse.materials || [];
    let thumbnailUrl = existingCourse.thumbnail || "";

    // Handle multiple file uploads for materials
    if (req.files?.materials) {
      const newMaterials = await uploadFileToFirebase(req.files.materials);
      materialsUrl = [...materialsUrl, ...newMaterials]; // Merge existing and new files
    }

    // Handle multiple file uploads for gallery
    if (req.files?.gallery) {
      const newGallery = await uploadFileToFirebase(req.files.gallery);
      galleryUrl = [...galleryUrl, ...newGallery]; // Merge existing and new files
    }

    // Handle single image upload for thumbnail
    if (req.files?.thumbnail) {
      const uploadedThumbnail = await uploadFileToFirebase(req.files.thumbnail);
      thumbnailUrl = uploadedThumbnail[0]; // Replace thumbnail with the new one
    }

    // Add updated file URLs to update fields
    updateFields.gallery = galleryUrl;
    updateFields.materials = materialsUrl;
    updateFields.thumbnail = thumbnailUrl;

    // Update the course in the database
    const updatedCourse = await Course.findByIdAndUpdate(_id, updateFields, {
      new: true, // Return the updated document
    });

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Error updating course", error });
  }
};

  
  