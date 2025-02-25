const express = require("express");
const router = express.Router();
const exportData = require('../controllers/exportController');
const { auth } = require("../middleware/authorization");
 

router.post("/data", auth(["Admin", "Instructor","Manager","HR"]), exportData)
// router.post("/student",  auth(["Admin", "Instructor"]), upload.single("file"), importFromExcel);

module.exports = router;