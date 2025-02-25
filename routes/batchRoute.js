const express = require("express");
const { createBatch,
    getAllBatches,
    getBatchById,
    updateBatch  } = require("../controllers/batchController");
    const {auth} = require("../middleware/authorization")
        const router = express.Router();

router.post("/post", auth(["Admin","Instructor","Manager","HR"]),createBatch);
router.get("/getAll", auth(["Admin","Instructor","Manager","HR"]), getAllBatches);
router.get("/get", auth(["Admin","Instructor","Manager","HR"]),getBatchById);
router.post("/update", auth(["Admin","Instructor","Manager","HR"]), updateBatch);

module.exports = router;
