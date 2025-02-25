const express = require("express");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const { signUp,getAdmin, loginAdmin, getAllAdmins, updateAdmin ,sendOtpEmailAdmin ,verifyOtpAdmin,resetPasswordAdmin} = require("../controllers/adminController");
const {auth} = require("../middleware/authorization")
const router = express.Router();

 router.post("/signUp", signUp);

 router.post("/login", loginAdmin);

 router.get("/getAll", auth(["Admin"]), getAllAdmins); 

 router.get("/get", auth(["Admin"]), getAdmin);

 router.post("/update",upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'coverImg', maxCount: 1 },]), updateAdmin);
 
 router.post("/sendOtpEmail",   sendOtpEmailAdmin);

 router.post('/verifyOtp',   verifyOtpAdmin);

 router.post('/resetPassword',   resetPasswordAdmin)

module.exports = router;
