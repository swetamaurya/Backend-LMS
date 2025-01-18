const Admin = require("../models/adminModel");
const {Role} = require("../models/roleModel");
const { uploadFileToFirebase , bucket} = require('../utils/fireBase');

// const { uploadFileToFirebase , bucket} = require('../utils/fireBase');
const bcryptjs = require("bcryptjs")
const sendOTPEmail = require("../utils/mailSent");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");

// Generate OTP
function generateOtp() {
    return Math.floor(1000 + Math.random() * 900000).toString();
  }
  
// ======================================================================================================================
// ====================================================================================================================== 
 // Admin Sign-Up
 const signUp = async (req, res) => {
    const { email, name, mobile, password } = req.body;
    const roles = "Admin";
  const permissions = 
        ["Dashboard Management",
        "Employee Management",
        "Course Management",
        "class_management",
        "student_management",
        "messages",
        "system_management",
        "all_management"]
      
    const hashedPassword = await bcryptjs.hash(password, 10);
  
    try {
      const admin = await Admin.findOne({ email: email.toLowerCase() });
      if (admin) {
        return res.status(400).json({ error: "Email ID already exists!" });
      }
  
      // Check if Admin role exists
      let adminRole = await Role.findOne({ roles });
      if (!adminRole) {
        adminRole = new Role({
          roles,
          permissions: [
            "Dashboard Management",
            "Employee Management",
            "Course Management",
            "class_management",
            "student_management",
            "messages",
            "system_management",
            "all_management",
          ],
        });
        await adminRole.save();
      }
  
      // Create Admin admin
      const newadmin = new Admin({
        name,
        email: email.toLowerCase(),
        mobile,
        roles ,
        password: hashedPassword,
        permissions
      });
  
      console.log("newadmin",newadmin)
      await newadmin.save();
      return res.status(200).json({ message: "Admin created successfully!", newadmin });
    } catch (error) {
      console.error("Error creating Admin:", error.message);
      return res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
  };


// ======================================================================================================================
// ====================================================================================================================== 
// Admin Login
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email: email.toLowerCase() }).populate("roles");

    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const isPasswordMatch = await bcryptjs.compare(password, admin.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const token = jwt.sign(
      {
        _id: admin._id,
        name: admin.name,
        roles: admin.roles,
        permissions: admin.permissions,
        email: admin.email,
      },
      process.env.SECRET_KEY,
      { expiresIn: "30000h" }
    );

    return res.status(200).json({
      message: "Login Successfully!",
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        roles: admin.roles,
        permissions: admin.permissions,
      },
    });
  } catch (error) {
    console.error("Error logging in Admin:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};


// ======================================================================================================================
// ====================================================================================================================== 
// Get All Admins
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().populate("roles");
    return res.status(200).json({ message: "Admins fetched successfully!", admins });
  } catch (error) {
    console.error("Error fetching admins:", error.message);
    return res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
};


// ======================================================================================================================
// ====================================================================================================================== 
// Get single Admins
const getAdmin = async (req, res) => {
    try {
      const { _id } = req.query;
 
      if (!_id) {
        return res.status(400).json({ message: 'Admin ID (_id) is required.' });
      }
  
      const admin = await Admin.findById(_id)
        .populate('roles')
         .lean();
  
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found.' });
      }
  
      
  
      return res.status(200).json({ admin });
    } catch (error) {
      console.error('Error fetching admin:', error);
      return res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
  };


// ======================================================================================================================
// ====================================================================================================================== 
// Update (password) Admin
const updateAdmin = async (req, res) => {
  try {
    const { _id, newPassword, ...updateFields } = req.body;

    // Validate admin ID
    if (!_id) {
      return res.status(400).json({ message: 'Admin ID is required for updating.' });
    }

    let coverImgUrl = "";
    let imgUrl = "";

    // Handle multiple file uploads
    if (req.files?.coverImg) {
      const uploadedImages = await uploadFileToFirebase(req.files.coverImg);
      coverImgUrl = uploadedImages[0];
      updateFields.coverImg = coverImgUrl; // Add image URL to update fields
    }

    // Handle single image upload
    if (req.files?.image) {
      const uploadedImages = await uploadFileToFirebase(req.files.image);
      imgUrl = uploadedImages[0];
      updateFields.image = imgUrl; // Add image URL to update fields
    }

    const existingAdmin = await Admin.findById(_id);
    if (!existingAdmin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    // Hash new password if provided
    if (newPassword) {
      updateFields.password = await bcryptjs.hash(newPassword, 10);
    }

    // Update admin in the database
    const updatedAdmin = await Admin.findByIdAndUpdate(
      _id,
      { ...updateFields }, // Apply all updates
      { new: true } // Return the updated document
    ) 

    if (!updatedAdmin) {
      return res.status(500).json({ message: 'Error updating admin data.' });
    }

    return res.status(200).json({
      message: `${updatedAdmin.firstName} ${updatedAdmin.lastName} Updated Successfully!`,
      updatedAdmin,
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    return res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
};


// ======================================================================================================================
// ====================================================================================================================== 
// reset password
const sendOtpEmailAdmin =  async (req, res) => {
    const { email } = req.body;
 console.log(req.body)
   if (!email) {
     return res.status(400).json("Email is required!");
   }
   try {
     const admin = await Admin.findOne({ email: email.toLowerCase() });
     if (!admin) return res.status(400).json("Admin not found!");
     
     const otp = generateOtp();
//  console.log(otp)
     admin.currentOtp = otp;
     await admin.save();
 
     // Send OTP email
     sendOTPEmail(admin.email, otp);
 console.log(otp)
     res.status(200).json({message:"OTP sent to email successfully!"});
   } catch (error) {
     console.error("Internal server error:", error.message);
     res.status(500).json("Internal server error:", error.message);
   }
 }

// ======================================================================================================================
// ====================================================================================================================== 
// verify password
 const verifyOtpAdmin = async (req, res) => {
const { email, currentOtp } = req.body;
console.log(req.body)
if (!email || !currentOtp) {
  return res.status(400).json({ message: 'Email and OTP are required' });
}

try {
  // Find admin by email and OTP
  const admin = await Admin.findOne({ email: email.toLowerCase(), currentOtp });

  if (!admin) {
    return res.status(404).json({ message: 'Admin not found or invalid OTP' });
  }

 
  admin.currentOtp   // Clear OTP after verification
  await admin.save();
console.log(admin)
  res.status(200).json({
    message: 'OTP Verified Successfully!',
  });
} catch (error) {
  logger.error(`Error managing encryption keys: ${error.message}`);
  res.status(500).json({ message: 'Internal server error' });
}
}

// ======================================================================================================================
// ====================================================================================================================== 
// reset password
const resetPasswordAdmin = async (req, res) => {
const { email, currentOtp, newPassword } = req.body;
console.log(req.body)
if (!email || !currentOtp || !newPassword) {
  return res.status(400).json("Email, OTP, and new password are required.");
}

try {
  let admin = await Admin.findOne({ email, currentOtp });

  if (!admin) {
    return res.status(404).json("Invalid OTP or admin not found.");
  }



  const hashNewPassword = await bcryptjs.hash(newPassword, 10);
  admin.password = hashNewPassword;
  admin.currentOtp = null; // Clear OTP after reset
 
  await admin.save();

  res.status(200).json("Your password changed successfully!.");
} catch (error) {
  console.log(`Error managing encryption keys: ${error.message}`);
  res.status(500).json(`Error managing encryption keys: ${error.message}`);
}
}

module.exports = { signUp, loginAdmin, getAllAdmins,getAdmin, updateAdmin,sendOtpEmailAdmin , verifyOtpAdmin, resetPasswordAdmin };
