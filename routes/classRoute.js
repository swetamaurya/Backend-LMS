const express = require("express");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // Adjust storage as needed
const { createClass,
    getAllClasses,
    getSingleClass,
    updateClass  } = require("../controllers/classController");
const { auth } = require("../middleware/authorization");
const router = express.Router();

router.post("/post", auth(["Admin", "Instructor", "Students", "Manager", "HR"]), upload.array("materials"), createClass);
router.get("/getAll", auth(["Admin","Instructor","Students","Manager","HR"]), getAllClasses);
router.get("/get", auth(["Admin","Instructor","Students","Manager","HR"]),getSingleClass);
router.post("/update", auth(["Admin","Instructor","Students","Manager","HR"]), upload.array('materials'), updateClass);

module.exports = router;
