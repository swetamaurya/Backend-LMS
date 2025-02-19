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
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json('Please provide email and password!.');
  }

  try {
    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() }).populate("roles")

    if (!user) {
      return res.status(400).json('Invalid login credentials!');
    }


    // Check if the password matches
    const isPasswordMatch = await bcryptjs.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json('Invalid login credentials!');
    }

    // Generate JWT token with essential user data
    const token = jwt.sign(
      { 
        _id: user._id, // Include only essential user information in the token
        roles: user.roles,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,

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
        roles: user.roles,
        image: user.image,
      },
    });
  } catch (err) {
    console.error('Internal server error:', err.message);
    return res.status(500).json("Internal server error:", err.message);
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
    const { roles, _id } = req.user;
    const { page  , limit  } = req.query;

    // Fetch the ObjectId of the "Student" role
    const studentRole = await Role.findOne({ roles: "Students" }).lean();
    if (!studentRole) {
      return res.status(404).json({ message: "Students role not found" });
    }

    let query = { roles: { $ne: studentRole._id } }; // Exclude students

    if (roles === "Admin") {
      query = { roles: { $ne: studentRole._id } }; // Admin can see all except students
    } else if (["HR", "Instructor", "Manager"].includes(roles)) {
      query = { _id, roles: { $ne: studentRole._id } }; // Restrict to self but exclude students
    } else {
      return res
        .status(403)
        .json({ message: "Access denied: Insufficient permissions." });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit || 0);

    const users = await User.find(query)
      .populate("roles")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalUsers = await User.countDocuments(query);
    const totalPages = limit ? Math.ceil(totalUsers / parseInt(limit)) : 1;

    return res.status(200).json({
      message: "Users fetched successfully!",
      data: users,
      totalUsers,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: parseInt(page),
        perPage: limit ? parseInt(limit) : totalUsers,
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
      return res.status(400).json({ message: 'User ID is required for updating.' });
    }

    let fileUrls = [];
    let imgUrl = "";

    // Handle multiple file uploads
    if (req.files?.files) {
      fileUrls = await uploadFileToFirebase(req.files.files);
      updateFields.files = fileUrls; // Add file URLs to update fields
    }

    // Handle single image upload
    if (req.files?.image) {
      const uploadedImages = await uploadFileToFirebase(req.files.image);
      imgUrl = uploadedImages[0];
      updateFields.image = imgUrl; // Add image URL to update fields
    }

    const existingUser = await User.findById(_id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Hash new password if provided
    if (newPassword) {
      updateFields.password = await bcryptjs.hash(newPassword, 10);
    }

    // Update user in the database
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { ...updateFields }, // Apply all updates
      { new: true } // Return the updated document
    ).populate('roles');

    if (!updatedUser) {
      return res.status(500).json({ message: 'Error updating user data.' });
    }

    return res.status(200).json({
      message: `${updatedUser.first_name} ${updatedUser.last_name} Updated Successfully!`,
      updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
};




 
module.exports = {
    login , resetPassword , verifyOtp, sendOtpEmail ,userPost 
    ,getAllUser, getUser , updatedUser   
}