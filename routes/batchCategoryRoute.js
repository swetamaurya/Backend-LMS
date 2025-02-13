const express = require("express");
const { createBatchCategory,
    // deleteStudent,
    getAllBatchCategory,
    getBatchCategoryById,
    updateBatchCategory  } = require("../controllers/batchCategoryController");
const { auth } = require("../middleware/authorization");
const router = express.Router();

router.post("/post", auth(["Admin","Instructor"]),createBatchCategory);
router.get("/getAll", auth(["Admin","Instructor"]), getAllBatchCategory);
router.get("/get", auth(["Admin","Instructor"]),getBatchCategoryById);
router.post("/update", auth(["Admin","Instructor"]), updateBatchCategory);
// router.post("/delete", auth(["Admin","Instructor"]),deleteStudent);

module.exports = router;
