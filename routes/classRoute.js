const express = require("express");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { createClass,
    getAllClasses,
    getSingleClass,
    updateClass  } = require("../controllers/classController");
const { auth } = require("../middleware/authorization");
const router = express.Router();

router.post("/post",upload.array('materials'), auth(["Admin","Instructor"]),createClass);
router.get("/getAll", auth(["Admin","Instructor"]), getAllClasses);
router.get("/get", auth(["Admin","Instructor"]),getSingleClass);
router.post("/update", upload.array('materials'), auth(["Admin","Instructor"]), updateClass);

module.exports = router;
