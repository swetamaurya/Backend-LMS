const { Role } = require('../models/roleModel');

 

// Create a new role
const createRole = async (req, res) => {
  try {
    const { roles, permission , status  , name } = req.body;

    if (!roles) {
      return res.status(400).json({ message: "Roles are required to create a role." });
    }

    const newRole = new Role({
        roles,
      permission,
      status , 
      name
      
    });

    const savedRole = await newRole.save();
     
    res.status(200).json({ message: `${roles} Created Successfully!`, role: savedRole });
  } catch (error) {
    console.error("Error creating role:", error.message);
    res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
};


// Get all roles
const getAllRoles = async (req, res) => {
  try {
    const { page = 1, limit = 10} = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [roles, totalRoles] = await Promise.all([
      Role.find()
      // .populate("name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Role.countDocuments(),
    ]);

    res.status(200).json({
      message: "Roles Fetched Successfully!",
      roles,
      pagination: {
        total: totalRoles,
        currentPage: parseInt(page),
        perPage: parseInt(limit),
        totalPages: Math.ceil(totalRoles / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching roles:", error.message);
    res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
};


// Get a single role by ID
const getRoleById = async (req, res) => {
  try {
    const { _id } = req.query;

    const role = await Role.findById(_id)
    // .populate("name");
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.status(200).json({ message: "Role Fetched Successfully!", role });
  } catch (error) {
    console.error("Error fetching role:", error.message);
    res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
};


// Update a role
const updateRole = async (req, res) => {
    try {
      const { _id, ...updateData } = req.body; // Extract _id and the fields to update
  
      // Check if the role exists
      const existingRole = await Role.findById(_id);
      if (!existingRole) {
        return res.status(404).json({ message: "Role not found" });
      }
  
      // Update the role
      const updatedRole = await Role.findByIdAndUpdate(
        _id,
        updateData, // Pass the update data object directly
        { new: true } // Return the updated document
      );
  
      if (!updatedRole) {
        return res.status(404).json({ message: "Role not found" });
      }
  
      res.status(200).json({ message: "Role Updated Successfully!", role: updatedRole });
    } catch (error) {
      console.error("Error updating role:", error.message);
      res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
  };
  

 

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole 
};
