const express = require("express");
const {auth} = require("../middleware/authorization")
const { deleteAll, deleteFile }   = require("../controllers/deleteController");
 const router = express.Router();
 

// Delete All Records (Protected route)
router.post("/all", auth(["Admin", "Instructor"]), deleteAll);

router.post('/file', auth(["Admin", "Instructor"]), deleteFile)

module.exports = router;
