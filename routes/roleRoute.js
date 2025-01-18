const express = require("express");
const {auth} = require("../middleware/authorization")
const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
} = require("../controllers/roleController");

const router = express.Router();

// Role Management Routes (Protected for Admin roles)
router.post("/post", auth(["Admin"]), createRole);
router.get("/getAll", auth(["Admin"]), getAllRoles);
router.get("/get", auth(["Admin"]), getRoleById);
router.post("/update", auth(["Admin"]), updateRole);

module.exports = router;
