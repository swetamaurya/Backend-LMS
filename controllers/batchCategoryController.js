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
                s.registration_number === newStudent.registration_number ||
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

// exports.updateBatchCategory = async (req, res) => {
//   try {
//     const { _id, batchIds, student, ...updateFields } = req.body;
//     console.log("Request Body:", req.body);

//     let updatedBatchCategory = null;

//     //   Update a single batch if `_id` is provided
//     if (_id) {
//       updatedBatchCategory = await BatchCategory.findByIdAndUpdate(
//         _id,
//         updateFields,
//         { new: true }
//       );

//       if (!updatedBatchCategory) {
//         return res.status(404).json({ message: "Batch Category not found" });
//       }
//     }

//     //   Update multiple batches with student replacement logic
//     let updatedBatches = null;
//     if (batchIds && student && student.length > 0) {
//       updatedBatches = await Promise.all(
//         batchIds.map(async (batchId) => {
//           const batch = await BatchCategory.findById(batchId);
//           if (!batch) return null;
 
//           student.forEach((newStudent) => {
//             if (!batch.student || !Array.isArray(batch.student)) {
//               // ✅ Initialize as an empty array if batch.student is missing or not an array
//               batch.student = [];
//             }
          
//             // Check if the student already exists in batch.student array
//             const existingIndex = batch.student.findIndex(
//               (s) =>
//                 s.registration_number === newStudent.registration_number ||
//                 (s.first_name === newStudent.first_name &&
//                   s.last_name === newStudent.last_name)
//             );
          
//             if (existingIndex !== -1) {
//               // ✅ Update the existing student
//               batch.student[existingIndex] = {
//                 ...batch.student[existingIndex], // Keep existing properties
//                 ...newStudent, // Merge new data
//               };
//             } else {
//               // ✅ Add new student if they do not exist
//               batch.student.push(newStudent);
//             }
//           });
          
//           // Save batch after updating the student array
//           await batch.save();
          
//         })
//       );
//     }

//     return res.status(200).json({
//       message: "Batch Category updated successfully",
//       batch: updatedBatchCategory,
//       updatedBatches,
//     });

//   } catch (error) {
//     return res.status(500).json({ message: `Error updating batch: ${error.message}` });
//   }
// };

// exports.updateBatchCategory = async (req, res) => {
//   try {
//     const { batchIds, student, ...updateFields } = req.body;

  //   if (!batchIds || batchIds.length === 0) {
  //     return res.status(400).json({ message: "Batch IDs are required" });
  //   }

  //   if (!student || student.length === 0) {
  //     return res.status(400).json({ message: "Students data is required" });
  //   }

  //   let updatedBatches = [];

  //   // Loop through each batchId
  //   for (const batchId of batchIds) {
  //     let batch = await BatchCategory.findById(batchId);
  //     console.log('batchstudent', batch.student['_id']);
      
  //     if (!batch) {
  //       // 🛑 If batch doesn't exist, create a new one
  //       batch = new BatchCategory({
  //         _id: batchId,
  //         student: student, // Add students to new batch
  //         ...updateFields,
  //       });
  //       console.log(
  //         'batch' , batch
  //       );
  //       // student.forEach((newStudent) => {
  //       //   if (!existingStudentIds.has(String(newStudent._id))) {
  //       //     batch.student.push(newStudent);
  //       //   }
  //       // });
  //     } else {
  //       console.log('btach',batch);
  //       // ✅ If batch exists, add new students only if they don't exist
  //       const existingStudentIds = new Set(batch.student.map((s) => String(s._id)));

  //       student.forEach((newStudent) => {
  //         if (!existingStudentIds.has(String(newStudent._id))) {
  //           batch.student.push(newStudent);
  //         }
  //       });
  //     }

  //     const updatedBatch = await batch.save();
  //     updatedBatches.push(updatedBatch);
  //   }

  //   return res.status(200).json({
  //     message: "Batch categories updated successfully",
  //     updatedBatches,
  //   });

  // } catch (error) {
  //   return res.status(500).json({ message: `Error updating batch: ${error.message}` });
  // }
//   const batchCategory = await BatchCategory.find();
//   let update; 
//   let response=[];
//   batchCategory.map((e)=>{
//     if(e.createList!='' && e.student!=[]){
//       if(e.student._id === student){
//         student.forEach((newStudent) => {
//           update = BatchCategory.findByIdAndUpdate(newStudent)
//         });
//       }
//       else{
//         batch = new BatchCategory({
//                   student: student, // Add students to new batch
//                   ...updateFields,
//                 });
//       }
//       response.push(student)
//       response.push(...updateFields)
//     }
//   })
//   res.status(200).json({message:'Data added successfully: ',response})
// }catch(error){
//   console.log(error);
//   res.status(500).json({message:'Internal Server Error: ',error})
// }
// };













 
