const Role = require("../models/roleModel");
const Batch = require("../models/batchModel");
const Class = require("../models/classModel");
const Course = require("../models/courseModel");
const { User } = require("../models/userModel");
 const BatchCategory = require("../models/batchCategoryModel");
const Student = require("../models/studentModel");
const courseCategory = require("../models/courseCategoryModel")

const searchModels = async (req, res) => {
    try {
      const { modelName, search, roles, page = 1, pageSize = 10 } = req.body;
  
      // Map model names to their schemas
      const validModels = { User, Role, Batch, Class, Course,BatchCategory,Student,courseCategory};
      const Model = validModels[modelName];
      if (!Model) {
        return res.status(400).json({ message: "Invalid model name." });
      }
  
      // Define explicitly searchable fields (exclude fields like password, dates, etc.)
      const searchableFields = [
        "application_number",
        "first_name",
        "last_name",
        "email",
        "roles",
        "phone",
        "gender",
        "registration_number",
        "category",
        "date_of_birth",
        "applicationFee",
        "status",
        "userStatus",
        "apply_for",
        "createdAt",
 
      ];
  
      // Build the search query
      const searchQuery = {
        ...(roles && Array.isArray(roles) && roles.length > 0
          ? { roles: { $in: roles } }
          : {}),
        ...(search && search.trim()
          ? {
              $or: searchableFields.map((field) => ({
                [field]: { $regex: search.trim(), $options: "i" },
              })),
            }
          : {}),
      };
  
      // console.log("Refined Search Query:", JSON.stringify(searchQuery, null, 2));
  
      // Pagination parameters
      const skip = (parseInt(page) - 1) * parseInt(pageSize);
  
      // Base query
      let query = Model.find(searchQuery)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(parseInt(pageSize));
  
      // Conditional population
      if (modelName === "Student") {
        query = query.populate("batchId");  
      }  
  
      // Execute query and lean transformation
      const data = await query.lean();
  
      // Count total records
      const totalCount = await Model.countDocuments(searchQuery);
      const totalPages = Math.ceil(totalCount / pageSize);
  
      

      return res.status(200).json({
        message: "Data fetched successfully!",
        data,
        currentPage: parseInt(page),
        totalPages,
        totalCount,
      });
    } catch (error) {
      console.error("Error fetching data:", error.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  

module.exports = {
  searchModels,
};
