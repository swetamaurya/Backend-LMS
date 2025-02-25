const express = require("express");
const router = express.Router();
const { createStudent,loginStudent, getAllStudents, getStudent, updateStudent,studentDataUpdate } = require("../controllers/studentController");
const { auth } = require("../middleware/authorization");
// const upload = require("../middleware/upload");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/post",
  auth(["Admin", "Instructor","Manager","HR"]),
  upload.fields([{ name: "signature_path", maxCount: 1 },
    { name: "photo_path", maxCount: 1 },
  ]),
  createStudent
);

 

router.get("/getAll", auth(["Admin","Instructor","Manager","HR"]),getAllStudents);
router.get("/get", auth(["Admin","Instructor","Students","Manager","HR"]), getStudent);
router.post("/login",   loginStudent);

router.post(
    "/update",
    auth(["Admin", "Instructor","Manager","HR"]),
    upload.fields([{ name: "signature_path", maxCount: 1 },
      { name: "photo_path", maxCount: 1 },
    ]),
    updateStudent
  );

router.get("/studentDataUpdate", auth(["Admin", "Instructor","Manager","HR"]),studentDataUpdate);

module.exports = router;
