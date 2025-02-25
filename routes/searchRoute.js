const express = require("express");
const router = express.Router();
const {auth} = require("../middleware/authorization")
const { searchModels } = require("../controllers/searchController");
  
   
router.post("/data", auth(["Admin","Instructor","Manager","HR"]), searchModels)
 

module.exports = router
