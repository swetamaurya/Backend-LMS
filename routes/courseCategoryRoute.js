
const express = require("express");
const router = express.Router();
const {auth} = require("../middleware/authorization")
const {createCourseCategory,getAllCourseCategories,getCourseCategoryById,updateCourseCategory} = require("../controllers/courseCategoryController");

//  Create a new course category
router.post("/post",  auth(["Admin", "Instructor","Manager","HR"]), createCourseCategory);

//  Get all course categories
router.get("/getAll", auth(["Admin", "Instructor","Manager","HR"]), getAllCourseCategories);

//   Get a single course category by ID
router.get("/get", auth(["Admin", "Instructor","Manager","HR"]),  getCourseCategoryById);

//   Update a course category by ID
router.post("/update",  auth(["Admin", "Instructor","Manager","HR"]),  updateCourseCategory);


module.exports = router;
