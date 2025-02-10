const BatchCategory = require("../models/batchCategoryModel");

 
 

// // ================================================================================================
// // ================================================================================================
// Create a batch
exports.createBatchCategory = async (req, res) => {
  try {
     
    // Create and save the batch
    const batchCategory = new BatchCategory({
      ...req.body
    });
    const savedBatchCategory = await batchCategory.save();

    res.status(201).json({
      message: "Batch category created successfully!",
      savedBatchCategory,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating batch", error });
  }
};


 

// // ================================================================================================
// // ================================================================================================
// Get all batches with pagination  
exports.getAllBatchCategory = async (req, res) => {
  try {
    const { page, limit } = req.query;
 
    const query = {};
    const skip = (parseInt(page) - 1) * parseInt(limit || 0);

    let batchCategory;

    if (limit) {
      batchCategory = await BatchCategory.find(query)
        .populate("student")
        .sort({ _id: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    } else {
      batchCategory = await BatchCategory.find(query)
         .populate("student")
        .sort({ _id: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    const totalCount = await BatchCategory.countDocuments(query);
    const totalPages = limit ? Math.ceil(totalCount / parseInt(limit)) : 1;

    res.status(200).json({
      message: "Batch category fetched successfully",
      data: batchCategory,
      pagination: {
        totalCount,
        totalPages,
        currentPage: limit ? parseInt(page) : null,
        perPage: limit ? parseInt(limit) : totalCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: `Error fetching batch category: ${error.message}` });
  }
};


// // ================================================================================================
// // ================================================================================================
// Get a single batch by ID
exports.getBatchCategoryById = async (req, res) => {
  try {
    const { _id, page , limit  } = req.query; // Default page=1, limit=0 (all records)

    if (!_id) {
      return res.status(400).json({ message: "Batch ID (_id) is required" });
    }

    //  Fetch batch by ID and populate students
    const batch = await BatchCategory.findById(_id)
      .populate("student");

    if (!batch) {
      return res.status(404).json({ message: "Batch Category not found" });
    }

    //  Count total students in the batch (not batch categories)
    const totalCount = batch.student ? batch.student.length : 0;
    const totalPages = limit > 0 ? Math.ceil(totalCount / limit) : 1;

    //  Pagination object
    const pagination = {
      totalCount,
      totalPages,
      currentPage: limit > 0 ? Number(page) : null,
      perPage: limit > 0 ? Number(limit) : totalCount,
    };

    res.status(200).json({
      message: "Batch Category fetched successfully",
      batch,
      pagination,
    });

  } catch (error) {
    res.status(500).json({ message: `Error fetching batch: ${error.message}` });
  }
};



// // ================================================================================================
// // ================================================================================================
// Update a batch
exports.updateBatchCategory = async (req, res) => {
  try {
    const { _id, batchIds, student, ...updateFields } = req.body;
    console.log("Request Body:", req.body);

    let updatedBatchCategory = null;

    //   Update a single batch if `_id` is provided
    if (_id) {
      updatedBatchCategory = await BatchCategory.findByIdAndUpdate(
        _id,
        updateFields,
        { new: true }
      );

      if (!updatedBatchCategory) {
        return res.status(404).json({ message: "Batch Category not found" });
      }
    }

    //   Update multiple batches with student replacement logic
    let updatedBatches = null;
    if (batchIds && student && student.length > 0) {
      updatedBatches = await Promise.all(
        batchIds.map(async (batchId) => {
          const batch = await BatchCategory.findById(batchId);
          if (!batch) return null;

          student.forEach((newStudent) => {
            const existingIndex = batch.student.findIndex(
              (s) =>
                s.registrationNumber === newStudent.registrationNumber ||
                (s.first_name === newStudent.first_name &&
                  s.last_name === newStudent.last_name)
            );

            if (existingIndex !== -1) {
              //   Replace existing student
              batch.student[existingIndex] = newStudent;
            } else {
              //   Push new student if not found
              batch.student.push(newStudent);
            }
          });

          return batch.save(); //   Save batch after modification
        })
      );
    }

    return res.status(200).json({
      message: "Batch Category updated successfully",
      batch: updatedBatchCategory,
      updatedBatches,
    });

  } catch (error) {
    return res.status(500).json({ message: `Error updating batch: ${error.message}` });
  }
};



 
