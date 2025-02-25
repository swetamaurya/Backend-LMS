const Class = require("../models/classModel");
const { uploadFileToFirebase } = require("../utils/fireBase");
  
exports.createClass = async (req, res) => {
  try {
      // console.log("Received files:", req.files); // Debugging

      // if (!req.files || req.files.length === 0) {
      //     return res.status(400).json({ message: "No materials uploaded!" });
      // }

      // Ensure materialsUrls is an array of strings
      let materialsUrls = await Promise.all(req.files.map(file => uploadFileToFirebase(file)));

      // Flatten the array if needed
      materialsUrls = materialsUrls.flat(); 

      // console.log("Uploaded File URLs:", materialsUrls); // Debugging

      // Create class object
      const classData = {
          classTitle: req.body.classTitle,
          instructor: req.body.instructor,
          batch: req.body.batch,
          courseCategory: req.body.courseCategory,
          course: req.body.course,
          description: req.body.description,
          materials: materialsUrls,   
          fromDate: req.body.fromDate,
          toDate: req.body.toDate,
          schedule: req.body.schedule,
          liveLink: req.body.liveLink,
          videoLink: req.body.videoLink,
          status: "Scheduled",
          liveClassStatus: req.body.liveClassStatus || "true",
      };

      // Save class to DB
      const newClass = new Class(classData);
      const savedClass = await newClass.save();

      res.status(200).json({ message: "Class created successfully", class: savedClass });
  } catch (error) {
      console.error("Error creating class:", error);
      res.status(500).json({ message: `Error creating class: ${error.message}` });
  }
};





 
  
exports.getAllClasses = async (req, res) => {
  try {
    const { page, limit } = req.query;
 
 
    const query = {};
    const skip = (parseInt(page) - 1) * parseInt(limit || 0);

    let classes;

    if (limit) {
      classes = await Class.find(query)
        .populate("batch instructor courseCategory course")
        .sort({ _id: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    } else {
      classes = await Class.find(query).populate("batch instructor courseCategory course").sort({ _id : -1 });
    }

    const totalCount = await Class.countDocuments(query);
    const totalPages = limit ? Math.ceil(totalCount / parseInt(limit)) : 1;

    res.status(200).json({
      message: "Classes fetched successfully",
      data: classes,
      pagination: {
        totalCount,
        totalPages,
        currentPage: limit ? parseInt(page) : null,
        perPage: limit ? parseInt(limit) : totalCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: `Error fetching classes: ${error.message}` });
  }
};


 
exports.getSingleClass = async (req, res) => {
  try {
    const { _id } = req.query;
     const singleClass = await Class.findById(_id)        
     .populate("batch instructor courseCategory course")

    if (!singleClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json({ message: "Class fetched successfully", class: singleClass });
  } catch (error) {
    res.status(500).json({ message: `Error fetching class: ${error.message}` });
  }
};

 

exports.updateClass = async (req, res) => {
  try {
    const { _id, ...updateFields } = req.body;
  
 
    let fileUrls = [];
    if (req.files && req.files.materials) {
      fileUrls = req.files.materials.map((file) => file.path);
    }

    if (fileUrls.length > 0) {
      updateFields.materials = fileUrls;
    }

    const updatedClass = await Class.findByIdAndUpdate(_id, updateFields, { new: true });

    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json({
      message: "Class updated successfully",
      class: updatedClass,
    });
  } catch (error) {
    res.status(500).json({ message: `Error updating class: ${error.message}` });
  }
};

