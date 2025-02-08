const Batch = require("../models/batchModel");
// const Course = require("../models/courseModel")

// // ================================================================================================
// // ================================================================================================
// Create a batch
exports.createBatch = async (req, res) => {
  try {
    const {   ...batchData } = req.body;

    // // Validate course existence
    // const course = await Course.findById(courseId);
    // if (!course) {
    //   return res.status(404).json({ message: "Course not found" });
    // }

    // Set dynamic fields for batch
    // batchData.batchTitle = `${batchYear}-${course.title}`;
 
    // Create and save the batch
    const batch = new Batch(batchData);
    const savedBatch = await batch.save();

    res.status(201).json({
      message: "Batch created successfully",
      batch: savedBatch,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern.batchId) {
      return res.status(400).json({
        message: "Duplicate Batch ID. Please try again.",
        error,
      });
    }
    res.status(500).json({ message: "Error creating batch", error });
  }
};


 

// // ================================================================================================
// // ================================================================================================
// Get all batches with pagination  
exports.getAllBatches = async (req, res) => {
  try {
    const { page, limit } = req.query;
 
    const query = {};
    const skip = (parseInt(page) - 1) * parseInt(limit || 0);

    let batches;

    if (limit) {
      batches = await Batch.find(query)
        // .populate("course")
        .populate("batchCategory")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    } else {
      batches = await Batch.find(query)
        // .populate("course")
        .populate("batchCategory")
        .sort({ createdAt: -1 });
    }

    const totalCount = await Batch.countDocuments(query);
    const totalPages = limit ? Math.ceil(totalCount / parseInt(limit)) : 1;

    res.status(200).json({
      message: "Batches fetched successfully",
      data: batches,
      pagination: {
        totalCount,
        totalPages,
        currentPage: limit ? parseInt(page) : null,
        perPage: limit ? parseInt(limit) : totalCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: `Error fetching batches: ${error.message}` });
  }
};


// // ================================================================================================
// // ================================================================================================
// Get a single batch by ID
exports.getBatchById = async (req, res) => {
  try {
    const { _id } = req.query;
 
    const batch = await Batch.findById(_id)
    // .populate("course")
    .populate("batchCategory") 

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    res.status(200).json({ message: "Batch fetched successfully", batch });
  } catch (error) {
    res.status(500).json({ message: `Error fetching batch: ${error.message}` });
  }
};


// // ================================================================================================
// // ================================================================================================
// Update a batch
exports.updateBatch = async (req, res) => {
  try {
    const { _id, ...updateFields } = req.body;
 
 
    const updatedBatch = await Batch.findByIdAndUpdate(_id, updateFields, { new: true })
     

    if (!updatedBatch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    res.status(200).json({ message: "Batch updated successfully", batch: updatedBatch });
  } catch (error) {
    res.status(500).json({ message: `Error updating batch: ${error.message}` });
  }
};

