const express = require("express");
const { getAllResources } = require("../controllers/resourcesController");
    const {auth} = require("../middleware/authorization")
        const router = express.Router();

router.get("/getAll", auth(["Admin","Instructor","Manager","HR"]), getAllResources);

module.exports = router;
