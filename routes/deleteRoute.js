const express = require("express");
const {auth} = require("../middleware/authorization")
const deleteAll = require("../controllers/deleteController");
const router = express.Router();

// Delete All Records (Protected route)
router.post("/all", auth(["Admin"]), deleteAll);

module.exports = router;
