const Admin = require("../models/adminModel");
const Batch = require("../models/batchModel");
const Course = require("../models/courseModel");
const courseCategory = require("../models/courseCategoryModel");
const {User} = require("../models/userModel");
const Role   = require("../models/roleModel");
const { uploadFileToFirebase , bucket} = require('../utils/fireBase');
const BatchCategory = require("../models/batchCategoryModel");
const Student = require("../models/studentModel");
const Class = require("../models/classModel");
 
const deleteAll = async (req, res) => {
    try {
      const { _id } = req.body;
  
      // Validate `_id` input
      if (!_id || (Array.isArray(_id) && _id.length === 0)) {
        return res.status(400).json({ message: "No _id provided for deletion." });
      }
  
      // Normalize single ID to an array
      const _idArray = Array.isArray(_id) ? _id : [_id];
  
      // Array of models to check for deletion
      const models = [
        { name: "User", model: User },
        { name: "Role", model: Role },
        { name: "Admin", model: Admin },
        { name: "Batch", model: Batch },
        { name: "BatchCategory", model: BatchCategory } ,
        { name: "Course", model: Course },
        { name: "courseCategory", model: courseCategory },
        // { name: "Class", model: Class } ,
        { name: "Student", model: Student } ,
        

      ];
  
      let totalDeletedCount = 0;
      const deletionResults = [];
  
      // Loop through each model and attempt deletion
      for (const { name, model } of models) {
        const deletionResult = await model.deleteMany({ _id: { $in: _idArray } });
        if (deletionResult.deletedCount > 0) {
          totalDeletedCount += deletionResult.deletedCount;
          deletionResults.push({
            model: name,
            deletedCount: deletionResult.deletedCount,
          });
        }
      }
  
      // Check if any records were deleted
      if (totalDeletedCount === 0) {
        return res.status(404).json({
          message: "No records found for the provided ID(s) in any model.",
        });
      }
  
      // Return summary of deletion results
      return res.status(200).json({
        message: `${totalDeletedCount} records deleted successfully across models.`,
        deletionResults,
      });
    } catch (error) {
      console.error("Error deleting records:", error);
      return res
        .status(500)
        .json({ error: `Internal server error: ${error.message}` });
    }
  };

  const mongoose = require("mongoose");

  const deleteFile = async (req, res) => {
      const { _id, fileName } = req.body;
  
      if (!_id || !fileName) {
          return res.status(400).json({ message: "_id and fileName are required." });
      }
  
      // Validate _id format
      if (!mongoose.Types.ObjectId.isValid(_id)) {
          return res.status(400).json({ message: "Invalid _id format. Must be a valid MongoDB ObjectId." });
      }
      const objectId = new mongoose.Types.ObjectId(_id);
  
      const models = [
          { name: "User", model: User },
          { name: "Role", model: Role },
          { name: "Admin", model: Admin },
          { name: "Batch", model: Batch },
          { name: "BatchCategory", model: BatchCategory },
          { name: "Student", model: Student },
          { name: "Course", model: Course },
          { name: "courseCategory", model: courseCategory },
          { name: "Class", model: Class }
      ];
  
      try {
          let fileDeleted = false;
  
          for (const { name, model } of models) {
              // console.log(`Checking model: ${name} for _id: ${objectId}`);
  
              const record = await model.findById(objectId);
              if (!record) {
                  // console.log(`No record found for _id: ${objectId} in ${name}`);
                  continue;
              }
  
              // console.log(`Found record in ${name}:`, record);
  
              // Extract file name correctly
              const url = new URL(fileName);
              const extractedFileName = url.pathname.split("/").pop();
              // console.log(`Checking file in ${name}:`, extractedFileName);
  
              // Check in both gallery and materials fields
              const fileUrlToDelete = record.gallery?.find(fileUrl => fileUrl.includes(extractedFileName)) ||
                                      record.materials?.find(fileUrl => fileUrl.includes(extractedFileName));
  
              if (!fileUrlToDelete) {
                  console.log(`File ${extractedFileName} not found in ${name}`);
                  continue;
              }
  
              // Delete the file from Firebase Storage
              const file = bucket.file(extractedFileName);
              await file.delete();
  
              // Remove the file from the array
              record.gallery = record.gallery?.filter(fileUrl => fileUrl !== fileUrlToDelete);
              record.materials = record.materials?.filter(fileUrl => fileUrl !== fileUrlToDelete);
              await record.save();
  
              fileDeleted = true;
              return res.status(200).json({ message: `File deleted successfully from ${name}.` });
          }
  
          if (!fileDeleted) {
              return res.status(404).json({ message: "File not found in any model." });
          }
  
      } catch (error) {
          console.error("Error deleting file:", error);
          return res.status(500).json({ error: `Failed to delete file: ${error.message}` });
      }
  };
  

module.exports = {
  deleteAll , 
  deleteFile
}