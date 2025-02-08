const express = require("express");
const {RTCTokenGeneration,RTMTokenGeneration, createClass,
    getAllClasses,
    getSingleClass,
    updateClass  } = require("../controllers/classController");
const { auth } = require("../middleware/authorization");
const router = express.Router();

router.post("/rtc-token", RTCTokenGeneration);
router.post("rtm-token", RTMTokenGeneration);
router.post("/post", auth(["Admin","Instructor"]),createClass);
router.get("/getAll", auth(["Admin","Instructor"]), getAllClasses);
router.get("/get", auth(["Admin","Instructor"]),getSingleClass);
router.post("/update", auth(["Admin","Instructor"]), updateClass);

module.exports = router;
