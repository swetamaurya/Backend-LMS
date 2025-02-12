const Class = require("../models/classModel");
 
 

// Create a live/recorded class
exports.createClass = async (req, res) => {
    try {
      // Initialize class data from req.body
      const classData = { ...req.body };
  
      let materialsUrls = [];
  
      // Handle multiple file uploads for materials
      if (req.files?.materials) {
        materialsUrls = await uploadFileToFirebase(req.files.materials);
        classData.materials = materialsUrls; // Add file URLs to class data
      }
  
      // Create a new class instance
      const newClass = new Class(classData);
  
      // Save the class in the database
      const savedClass = await newClass.save();
  
      res.status(200).json({ message: "Class created successfully", class: savedClass });
    } catch (error) {
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
      classes = await Class.find(query).populate("batch instructor courseCategory course").sort({ _id: -1 });
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

