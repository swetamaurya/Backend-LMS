const express = require("express");
const router = express.Router();
const { createStudent, getAllStudents, getStudent, updateStudent } = require("../controllers/studentController");
const { auth } = require("../middleware/authorization");
// const upload = require("../middleware/upload");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/post",
  auth(["Admin", "Instructor"]),
  upload.fields([{ name: "signatureImage", maxCount: 1 },
    { name: "profileImage", maxCount: 1 },
  ]),
  createStudent
);

 

router.get("/getAll", auth(["Admin","Instructor"]),getAllStudents);
router.get("/get", auth(["Admin","Instructor"]), getStudent);
router.post(
    "/update",
    auth(["Admin", "Instructor"]),
    upload.fields([{ name: "signatureImage", maxCount: 1 },
      { name: "profileImage", maxCount: 1 },
    ]),
    updateStudent
  );

module.exports = router;
