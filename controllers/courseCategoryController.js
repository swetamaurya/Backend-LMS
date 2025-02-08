const courseCategory = require("../models/courseCategoryModel");
const Course = require("../models/courseModel");
 
// Create a New Course Category
exports.createCourseCategory = async (req, res) => {
    try {
       
        const newCategory = new courseCategory({ 
          ...req.body
        });
        console.log(newCategory)
        await newCategory.save();

        return res.status(200).json({
            message: "Course category created successfully!",
            category: newCategory
        });
    } catch (error) {
        console.error("Error creating course category:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

//  Get All Course Categories
exports.getAllCourseCategories = async (req, res) => {
    try {
        let { page, limit } = req.query;

        // Ensure page and limit have valid default values
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        const categories = await courseCategory.find()
            .sort({ _id: -1 }) // Sorting by newest first
            .skip(skip)
            .limit(limit);

        const totalCoursesCategories = await courseCategory.countDocuments();
        const totalPages = Math.ceil(totalCoursesCategories / limit);

        res.status(200).json({ 
            message: "Course categories fetched successfully",
            categories,
            pagination: {
                totalCoursesCategories,
                totalPages,
                currentPage: page,
                pageSize: limit,
            },
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


//  Get a Single Course Category by ID
exports.getCourseCategoryById = async (req, res) => {
    try {
        const { _id } = req.query;
        console.log(req.query)
        if (!_id) {
          return res.status(400).json({ message: 'Course Category ID is required.' });
        }
        const category = await courseCategory.findById(_id).lean();
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({ message: "Category fetched successfully!", category });
    } catch (error) {
        console.error("Error fetching category:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

//   Update Course Category by ID
exports.updateCourseCategory = async (req, res) => {
    try {
        const { _id, ...updateFields } = req.body;

        // Validate course ID
        if (!_id) {
          return res.status(400).json({ message: "Course Category ID is required for updating." });
        }
      
        const updatedCategory = await courseCategory.findByIdAndUpdate(
            _id, updateFields, { new: true })

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category updated successfully", category: updatedCategory });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

 
