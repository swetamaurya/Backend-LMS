const express = require("express");
const { createBatch,
    getAllBatches,
    getBatchById,
    updateBatch  } = require("../controllers/batchController");
    const {auth} = require("../middleware/authorization")
        const router = express.Router();

router.post("/post", auth(["Admin","Instructor"]),createBatch);
router.get("/getAll", auth(["Admin","Instructor"]), getAllBatches);
router.get("/get", auth(["Admin","Instructor"]),getBatchById);
router.post("/update", auth(["Admin","Instructor"]), updateBatch);

module.exports = router;
