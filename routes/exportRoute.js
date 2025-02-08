const express = require("express");
const router = express.Router();
const exportData = require('../controllers/exportController');
const { auth } = require("../middleware/authorization");
 

router.post("/data",  exportData)

module.exports = router;