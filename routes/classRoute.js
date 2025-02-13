const express = require("express");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { createClass,
    getAllClasses,
    getSingleClass,
    updateClass  } = require("../controllers/classController");
const { auth } = require("../middleware/authorization");
const router = express.Router();

router.post("/post",upload.array('materials'), auth(["Admin","Instructor","Students"]),createClass);
router.get("/getAll", auth(["Admin","Instructor","Students"]), getAllClasses);
router.get("/get", auth(["Admin","Instructor","Students"]),getSingleClass);
router.post("/update", upload.array('materials'), auth(["Admin","Instructor","Students"]), updateClass);

module.exports = router;
