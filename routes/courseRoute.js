const express = require("express");
const router = express.Router();
const { createCourse, getAllCourses, getCourse, updateCourse } = require("../controllers/courseController");
 const multer = require("multer");
 const {auth} = require("../middleware/authorization")
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/post",
  auth(["Admin", "Instructor","Manager","HR"]),
  upload.fields([{ name: "thumbnail", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
    { name: "materials", maxCount: 10 }
  ]),
  createCourse
);

 

router.get("/getAll", auth(["Admin","Instructor","Manager","HR"]), getAllCourses);
router.get("/get", auth(["Admin","Instructor","Manager","HR"]), getCourse);
router.post("/update",
    auth(["Admin", "Instructor","Manager","HR"]),
    upload.fields([{ name: "thumbnail", maxCount: 1 },
      { name: "gallery", maxCount: 10 },
      { name: "materials", maxCount: 10 }
    ]),
     updateCourse);

module.exports = router;
