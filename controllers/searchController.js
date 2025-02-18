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

        // Define valid models
        const validModels = { User, Role, Batch, Class, Course, BatchCategory, Student, courseCategory };
        const Model = validModels[modelName];

        if (!Model) {
            return res.status(400).json({ message: "Invalid model name." });
        }

        // Define searchable fields
        const studentSearchableFields = [
            "application_number",
            "first_name",
            "last_name",
            "email",
            "phone",
            "gender",
            "registration_number",
            "category",
            "date_of_birth",
            "apply_for",
            "createdAt",
        ];

        const batchCategorySearchableFields = ["createList","application_number",
            "first_name",
            "last_name",
            "email",
            "phone",
            "gender",
            "registration_number",
            "category",
            "date_of_birth",
            "apply_for",
            "createdAt"];

        // Construct search query
        const searchConditions = search
            ? {
                  $or: [
                      ...studentSearchableFields.map((field) => ({
                          [field]: { $regex: search, $options: "i" },
                      })),
                      ...batchCategorySearchableFields.map((field) => ({
                          [`students.${field}`]: { $regex: search, $options: "i" },
                      })),
                  ],
              }
            : {};

        const skip = (parseInt(page) - 1) * parseInt(pageSize);
        let data = [];
        let totalCount = 0;

        if (modelName === "BatchCategory") {
            // Aggregation to join BatchCategory with Student
            const pipeline = [
                {
                    $lookup: {
                        from: "students", // Ensure this matches the MongoDB collection name
                        localField: "student",
                        foreignField: "_id",
                        as: "students",
                    },
                },
                {
                    $match: searchConditions,
                },
                { $sort: { _id: -1 } },
                { $skip: skip },
                { $limit: parseInt(pageSize) },
            ];

            data = await BatchCategory.aggregate(pipeline);

            // Get total count
            const countPipeline = [
                {
                    $lookup: {
                        from: "students",
                        localField: "student",
                        foreignField: "_id",
                        as: "students",
                    },
                },
                {
                    $match: searchConditions,
                },
                {
                    $count: "totalCount",
                },
            ];

            const countResult = await BatchCategory.aggregate(countPipeline);
            totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;
        } else if (modelName === "Student") {
            // Normal search for students
            data = await Student.find(searchConditions)
                .sort({ _id: -1 })
                .skip(skip)
                .limit(parseInt(pageSize))
                .lean();

            totalCount = await Student.countDocuments(searchConditions);
        } else {
            // Default case for other models
            data = await Model.find(searchConditions)
                .sort({ _id: -1 })
                .skip(skip)
                .limit(parseInt(pageSize))
                .lean();

            totalCount = await Model.countDocuments(searchConditions);
        }

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
