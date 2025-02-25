const {User} = require("../models/userModel");
const Role   = require("../models/roleModel");

const { uploadFileToFirebase , bucket} = require('../utils/fireBase');

const bcryptjs = require("bcryptjs")
const sendOTPEmail = require("../utils/mailSent");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
 

// Generate OTP
function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}




///////////////////////////////////////////////////////// Admin & User Login ////////////////////////////////////////////////////////////////////


const login = async (req, res) => {
  try {
     const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password!." });
    }

    // Find user by email (case-insensitive) and populate roles
    const user = await User.findOne({ email: email.toLowerCase() }).populate("roles");

    if (!user) {
      return res.status(400).json({ message: "Invalid login credentials!" });
    }

    // Check if the password matches
    const isPasswordMatch = await bcryptjs.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid login credentials!" });
    }

    // Extract user roles correctly
    let userRoles = [];
    let userPermissions = [];

    if (typeof user.roles === "string") {
      userRoles = [user.roles]; // Case 1: Single role string
    } else if (Array.isArray(user.roles)) {
      userRoles = user.roles.map(role => role.roles || role); // Case 2: Multiple roles
      userPermissions = user.roles.flatMap(role => role.permissions || []); // Collect permissions from all roles
    } else if (user.roles && typeof user.roles === "object") {
      userRoles = [user.roles.roles]; // Case 3: Nested object
      userPermissions = user.roles.permissions || []; // Extract permissions
    }

    console.log("🔍 Extracted User Data:");
    console.log("Roles:", userRoles);
    console.log("Permissions:", userPermissions);

    // Generate JWT token with essential user data
    const token = jwt.sign(
      { 
        _id: user._id, 
        roles: userRoles,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
         permissions: userPermissions, // ✅ Now permissions are included
 
         image: user.image,
      },
      process.env.SECRET_KEY,
      { expiresIn: '10h' } // Token expires in 10 hours
    );

    return res.status(200).json({
      message: 'Login Successfully!',
      token,
      user: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
          email: user.email,
        roles: userRoles,
        permissions: userPermissions, // ✅ Now permissions are included in the response
        image: user.image,
      },
    });
  } catch (err) {
    console.error('Internal server error:', err.message);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

 



//////////////////////////////////////////////////////////// reset password all process ////////////////////////////////////////////////////////////////////

// send otp in mail
const sendOtpEmail =  async (req, res) => {
  const { email } = req.body;
// console.log(req.body)
 if (!email) {
   return res.status(400).json("Email is required!");
 }
 try {
   const user = await User.findOne({ email: email.toLowerCase() });
   if (!user) return res.status(400).json("User not found!");
   
   const otp = generateOtp();
//  console.log(otp)
   user.currentOtp = otp;
   await user.save();

   // Send OTP email
   sendOTPEmail(user.email, otp);
console.log(otp)
   res.status(200).json({message:"OTP sent to email successfully!"});
 } catch (error) {
   console.error("Internal server error:", error.message);
   return res.status(500).json("Internal server error:", error.message);
  }
}

// ================================================================================================
// ================================================================================================
// verify otp
const verifyOtp = async (req, res) => {
const { email, currentOtp } = req.body;
console.log(req.body)
if (!email || !currentOtp) {
return res.status(400).json({ message: 'Email and OTP are required' });
}

try {
// Find user by email and OTP
const user = await User.findOne({ email: email.toLowerCase(), currentOtp });

if (!user) {
  return res.status(404).json({ message: 'user not found or invalid OTP' });
}


user.currentOtp   // Clear OTP after verification
await user.save();

res.status(200).json({
  message: 'OTP Verified Successfully!',
});
} catch (error) {
logger.error(`Error managing encryption keys: ${error.message}`);
res.status(500).json({ message: 'Internal server error' });
}
}

// ================================================================================================
// ================================================================================================
// change password inter new password
const resetPassword = async (req, res) => {
  const { email, currentOtp, newPassword } = req.body;
  console.log(req.body)
  if (!email || !currentOtp || !newPassword) {
    return res.status(400).json("Email, OTP, and new password are required.");
  }
  
  try {
    let user = await User.findOne({ email, currentOtp });
  
    if (!user) {
      return res.status(404).json("Invalid OTP or user not found.");
    }
  
  
  
    const hashNewPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashNewPassword;
    user.currentOtp = null; // Clear OTP after reset
   
    await user.save();
  
    res.status(200).json("Your password changed successfully.");
  } catch (error) {
    console.error(`Error managing encryption keys: ${error.message}`);
    return res.status(500).json("Internal server error:", error.message);
  }
  }

//////////////////////////////////////////////////////////// create new user ////////////////////////////////////////////////////////////////////


// ================================================================================================
// ================================================================================================
const userPost = async (req, res) => {
  try {
    const { email, password, roles ,...userData} = req.body;
    if (!email || !password || !roles) {
      return res.status(400).json({ message: 'All fields are required to create a user.' });
    }
    // Check if the role exists
    const role = await Role.findById(roles);
    if (!role) {
      return res.status(404).json({ message: 'Specified role does not exist.' });
    }
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }
    let filesUrls = []
    let imageUrl = "";
    // Handle multiple file uploads for materials
    if (req.files?.files) {
      filesUrls = await uploadFileToFirebase(req.files.files);
      userData.files = filesUrls; // Add file URLs to course data
    }
    // Handle single file upload for thumbnail
    if (req.files?.image) {
      const uploadedimage = await uploadFileToFirebase(req.files.image);
      imageUrl = uploadedimage[0];
      userData.image = imageUrl;
    }
    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);
    // Create a new user
    const newUser = new User({
      ...userData,
      email: email.toLowerCase(),
      password: hashedPassword,
      roles: role._id, // Reference the existing role by its ID
    });
    const savedUser = await newUser.save();
    res.status(200).json({
      message: 'User Created Successfully!',
      user: savedUser,
    });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
};



const getAllUser = async (req, res) => {
  try {
    const { roles, id } = req.user; // Use `id` instead of `_id`
    const { page, limit } = req.query;

    if (!id) {
      return res.status(400).json({ message: "User ID not found. Please log in again." });
    }

    let query = {};

    if (roles.includes("Admin")) {
      query = {}; // Admin can see all users
    } else if (roles.some((role) => ["HR", "Instructor", "Manager"].includes(role))) {
      query = { _id: id }; // Only show the logged-in user
    } else {
      return res.status(403).json({ message: "Access denied: Insufficient permissions." });
    }

    // Debugging Logs
    console.log("🔍 Debugging Query:", query);
    console.log("📌 User Roles:", roles);
    console.log("📌 Logged-in User ID:", id);
    console.log("📌 Page:", page, "Limit:", limit);

    const pageNum = parseInt(page) || 1;
    const perPage = parseInt(limit) || 10;
    const skip = (pageNum - 1) * perPage;

    const users = await User.find(query)
      .populate("roles")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(perPage)
      .lean();

    console.log("📌 Fetched Users:", users.length);

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / perPage);

    return res.status(200).json({
      message: "Users fetched successfully!",
      data: users,
      totalUsers,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: pageNum,
        perPage: perPage,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
};







//////////////////////////////////////////////////////////// get single user ////////////////////////////////////////////////////////////////////


const getUser = async (req, res) => {
  try {
    const { _id } = req.query;

    if (!_id) {
      return res.status(400).json({ message: 'User ID (_id) is required.' });
    }

    const user = await User.findById(_id)
      .populate('roles')
       .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
};


//////////////////////////////////////////////////////////// update user ////////////////////////////////////////////////////////////////////

const updatedUser = async (req, res) => {
  try {
    const { _id, newPassword, ...updateFields } = req.body;

    // Validate user ID
    if (!_id) {
      return res.status(400).json({ message: "User ID is required for updating." });
    }

    let newFileUrls = [];
    let newImgUrl = "";

    // Find existing user first
    const existingUser = await User.findById(_id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Handle multiple file uploads (Append instead of replace)
    if (req.files?.files) {
      newFileUrls = await uploadFileToFirebase(req.files.files);
      updateFields.$push = { files: { $each: newFileUrls } }; // Append files instead of replacing
    }

    // Handle single image upload (replace only if a new image is uploaded)
    if (req.files?.image) {
      const uploadedImages = await uploadFileToFirebase(req.files.image);
      newImgUrl = uploadedImages[0];
      updateFields.image = newImgUrl; // Replace with new image
    }

    // Hash new password if provided
    if (newPassword) {
      updateFields.password = await bcryptjs.hash(newPassword, 10);
    }

    // Update user in the database with `$set` and `$push`
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        $set: updateFields, // Update only changed fields
        ...(updateFields.$push ? { $push: updateFields.$push } : {}), // Append new files without replacing old ones
      },
      { new: true } // Return the updated document
    ).populate("roles");

    if (!updatedUser) {
      return res.status(500).json({ message: "Error updating user data." });
    }

    return res.status(200).json({
      message: `${updatedUser.first_name} ${updatedUser.last_name} Updated Successfully!`,
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
};




 
module.exports = {
    login , resetPassword , verifyOtp, sendOtpEmail ,userPost 
    ,getAllUser, getUser , updatedUser   
}