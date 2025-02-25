const express = require("express");
const {auth} = require("../middleware/authorization")
const { deleteAll, deleteFile }   = require("../controllers/deleteController");
 const router = express.Router();
 

// Delete All Records (Protected route)
router.post("/all", auth(["Admin", "Instructor","Manager","HR"]), deleteAll);

router.post('/file', auth(["Admin", "Instructor","Manager","HR"]), deleteFile)

module.exports = router;
