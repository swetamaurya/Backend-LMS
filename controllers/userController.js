const User = require("../models/userModel");
const { Role } = require("../models/roleModel");

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
    const user = await User.findOne({ email: email.toLowerCase() });

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
        name: user.name,
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
        name: user.name,
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


const userPost = async (req, res) => {
  try {
    const { email, password, roles } = req.body;

    // Validate required fields
    if (!email || !password || !roles ) {
      return res.status(400).json({ message: "All fields are required to create a user." });
    }

    // console.log("Request Body:", req.body);
    // console.log("Uploaded Files:", req.files);

    let fileUrls = [];
    let imgUrl = "";

    // Handle files array
    if (req.files && req.files.files) {
      fileUrls = await uploadFileToFirebase(req.files.files);
    }

    // Handle single image file
    if (req.files && req.files.image) {
      const uploadedImages = await uploadFileToFirebase(req.files.image);
      imgUrl = uploadedImages[0]; // Since it's a single image, use the first URL
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists!" });
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create a new user
    const newUser = new User({
      ...req.body,
      email: email.toLowerCase(),
      password: hashedPassword,
      roles,
      image: imgUrl, // Store the image URL
      files: fileUrls, // Store file URLs
     
    });

    await newUser.save();

    return res.status(200).json({
      message: "User created successfully!",
      newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error.message);
    return res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
};



//////////////////////////////////////////////////////////// get all user ////////////////////////////////////////////////////////////////////

  
// const getAllUser = async (req, res) => {
//   try {
//     const { roles, _id } = req.user; // Authenticated user details
//     const { page, limit } = req.query; // Pagination parameters from frontend

//     // console.log(req.user);

//     let query = {};

//     // Define query based on the role
//     if (roles === 'Admin') {
//       query = {}; // Admin can view all users
//     } else if (['Students', 'HR', 'Instructor', 'Manager'].includes(roles)) {
//       query = { _id }; // Restrict non-admin roles to their own data
//     } else {
//       return res
//         .status(403)
//         .json({ message: 'Access denied: Insufficient permissions.' });
//     }

//     // Get role ObjectIds
//     const roleIds = await Role.find({
//       roles: { $in: ['Manager', 'Students', 'HR', 'Instructor'] },
//     })
//       .lean()
//       .select('roles _id');

//       console.log(roleIds)

//     const roleMap = roleIds.reduce((acc, role) => {
//       acc[role.roles] = role._id;
//       return acc;
//     }, {});

//     // console.log(roleMap)
//     // Pagination logic
//     const parsedPage = page ? Math.max(1, parseInt(page)) : null;
//     const parsedLimit = limit ? Math.max(1, parseInt(limit)) : null;
//     const skip = parsedPage && parsedLimit ? (parsedPage - 1) * parsedLimit : 0;


//     // Define role queries
//     const managerQuery = { ...query, roles: roleMap['Manager'] };
//     const studentQuery = { ...query, roles: roleMap['Students'] };
//     const hrQuery = { ...query, roles: roleMap['HR'] };
//     const instructorQuery = { ...query, roles: roleMap['Instructor'] };

//  console.log({ managerQuery, studentQuery, hrQuery, instructorQuery });
 

// const [managers, students, hr, instructors] = await Promise.all([
//       User.find(managerQuery)
//         .populate('roles')
//         .sort({ _id: -1 })
//         .skip(skip)
//         .limit(parsedLimit)
//         .lean(),
//       User.find(studentQuery)
//         .populate('roles')
//         .sort({ _id: -1 })
//         .skip(skip)
//         .limit(parsedLimit)
//         .lean(),
//       User.find(hrQuery)
//         .populate('roles')
//         .sort({ _id: -1 })
//         .skip(skip)
//         .limit(parsedLimit)
//         .lean(),
//       User.find(instructorQuery)
//         .populate('roles')
//         .sort({ _id: -1 })
//         .skip(skip)
//         .limit(parsedLimit)
//         .lean(),
//     ]);

//     // Count totals for each role
//     const [totalManagers, totalStudents, totalHR, totalInstructors] =
//       await Promise.all([
//         User.countDocuments(managerQuery),
//         User.countDocuments(studentQuery),
//         User.countDocuments(hrQuery),
//         User.countDocuments(instructorQuery),
//       ]);


//     // Response
//     return res.status(200).json({
//       data: {
//         managers: {
//           total: totalManagers,
//           data: managers,
//         },
//         students: {
//           total: totalStudents,
//           data: students,
//         },
//         hr: {
//           total: totalHR,
//           data: hr,
//         },
//         instructors: {
//           total: totalInstructors,
//           data: instructors,
//         },
//       },
//       pagination: {
//         totalUsers: totalManagers + totalStudents + totalHR + totalInstructors,
//         currentPage: parsedPage || '',
//         pageSize: parsedLimit || '',
//       },
//     });
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     return res.status(500).json({ message: `Internal server error: ${error.message}` });
//   }
// };
const getAllUser = async (req, res) => {
  try {
    const { roles, _id } = req.user; // Authenticated user details
    const { page = 1, limit=10 } = req.query; // Pagination parameters

    let query = {};

    // Define query based on role
    if (roles === 'Admin') {
      query = {}; // Admin can view all users
    } else if (['Students', 'HR', 'Instructor', 'Manager'].includes(roles)) {
      query = { _id }; // Restrict non-admin roles to their own data
    } else {
      return res
        .status(403)
        .json({ message: 'Access denied: Insufficient permissions.' });
    }

    // Check if pagination parameters are provided
    const skip = (parseInt(page) - 1) * parseInt(limit || 0); // Records to skip
    // Fetch data with or without pagination
    let users;
 
 if(limit){
      users = await User.find(query)
        .populate('roles')
        .sort({ _id: -1 })
        .skip(skip)
          .limit(parseInt(limit))
          .sort({ _id: -1 })
          .lean();
      // totalUsers = await User.countDocuments(query);
    } else {
      users = await User.find(query).populate('roles')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ _id: -1 })
      .lean();
      // totalUsers = users.length; // Total count is the array length when no pagination
    }

    const totalUsers = await User.countDocuments(query);
    const totalPages = limit ? Math.ceil(totalUsers / parseInt(limit)) : 1;

    // Response
    return res.status(200).json({
      message: 'User fetched successfully!',

      data: users,
      totalUsers,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: parseInt(page),
        perPage: limit ? parseInt(limit) : totalUsers,
      },    });
  } catch (error) {
    console.error('Error fetching users:', error);
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
      message: `${updatedUser.firstName} ${updatedUser.lastName} Updated Successfully!`,
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