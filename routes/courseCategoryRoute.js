
const express = require("express");
const router = express.Router();
const { auth } = require("../Middleware/authorization")

const {createCourseCategory,getAllCourseCategories,getCourseCategoryById,updateCourseCategory} = require("../controllers/courseCategoryController");

//  Create a new course category
router.post("/post",  auth(["Admin", "Instructor"]), createCourseCategory);

//  Get all course categories
router.get("/getAll", auth(["Admin", "Instructor"]), getAllCourseCategories);

//   Get a single course category by ID
router.get("/get", auth(["Admin", "Instructor"]),  getCourseCategoryById);

//   Update a course category by ID
router.post("/update",  auth(["Admin", "Instructor"]),  updateCourseCategory);


module.exports = router;
