const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/authorization");
const multer = require("multer");
const {
  login,
  resetPassword,
  userPost,
  getAllUser,
  getUser,
  updatedUser,
  sendOtpEmail,
  verifyOtp
} = require("../controllers/userController");

const upload = multer({ storage: multer.memoryStorage() });

/////////////////////////////////////////////////////////// login & resetPassword //////////////////////////////////////////////////////////

router.post("/login", login); // User login
router.post("/sendOtpEmail",   sendOtpEmail);
router.post('/verifyOtp',   verifyOtp);
router.post('/resetPassword',   resetPassword)



////////////////////////////////////////////////////////////// create user ////////////////////////////////////////////////////////////////

router.post(
  '/post',
  auth(['Admin', 'HR']),
  upload.fields([
    { name: 'image', maxCount: 1 }, // Single file for image
    { name: 'files', maxCount: 10 }, // Multiple files
  ]),
  userPost
);



//////////////////////////////////////////////////////////////// get single user ////////////////////////////////////////////////////////////////


router.get("/get", auth(['Admin']), getUser);


//////////////////////////////////////////////////////////////// get all user ////////////////////////////////////////////////////////////////


router.get("/getAll", auth(["Admin"]), getAllUser);


//////////////////////////////////////////////////////////////// user update ////////////////////////////////////////////////////////////////


router.post("/update",  auth(['Admin']),
upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'files', maxCount: 10 },
]), updatedUser);


module.exports = router;
