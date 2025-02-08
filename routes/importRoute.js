const express = require('express');
const router = express.Router();
const {auth} = require("../middleware/authorization")
const multer = require('multer');
const storage = multer.memoryStorage();  
const upload = multer({ storage });
const {getAdminDashboard , getEmployeeCoverage, exportFile ,importFromExcel} = require("../controllers/dashboardController");

router.get('/getAll',auth, getAdminDashboard);
router.get("/employee/coverage", auth,getEmployeeCoverage);

// Export data to Excel
router.post("/export", auth, exportFile);

// Import data from Excel
router.post("/import", auth, upload.single("file"), importFromExcel);

module.exports = router;

 