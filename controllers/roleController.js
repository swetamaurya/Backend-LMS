const Role  = require('../models/roleModel');
const mongoose = require("mongoose");

 
const createRole = async (req, res) => {
  try {
    const { roles, permission, name } = req.body; // 'name' represents employee ID

    // Condition 1: If role is not selected, return an error
    if (!roles) {
      return res.status(400).json({ message: 'Please select a role.' });
    }

    // Condition 2: If name is provided but not a valid ObjectId, return an error
    if (name && !mongoose.Types.ObjectId.isValid(name)) {
      return res.status(400).json({ message: 'Invalid Employee ID format.' });
    }

    // Condition 3: Check if the exact same role with the same employee ID exists
    let existingRoleWithId = await Role.findOne({ roles, name });
    if (existingRoleWithId) {
      return res.status(400).json({
        message: `Role already exists!`,
        role: existingRoleWithId,
      });
    }

    // Condition 4: If role exists but with a different employee, allow creation
    // This ensures that the same role can be assigned to different employees
    let existingRole = await Role.findOne({ roles, name: { $ne: name } });
    
    if (existingRole) {
      const newRole = new Role({
        roles,
        permission,
        name,
      });
      const savedRole = await newRole.save();
      return res.status(201).json({
        message: `Role '${roles}' assigned to employee successfully!`,
        role: savedRole,
      });
    }

    // Condition 5: If employee exists but with a different role, allow creation
    let existingEmployee = await Role.findOne({ name, roles: { $ne: roles } });
    
    if (existingEmployee) {
      const newRole = new Role({
        roles,
        permission,
        name,
      });
      const savedRole = await newRole.save();
      return res.status(200).json({
        message: `Role created successfully${name ? " with employee name!" : "!"}`,
        role: savedRole,
      });
    }

    // Condition 6: If role & name are unique, save new role
    const newRole = new Role({
      roles,
      permission,
      name,
    });

    const savedRole = await newRole.save();
    return res.status(200).json({ message: `'${roles}' created successfully!`, role: savedRole });

  } catch (error) {
    console.error('Error creating role:', error.message);
    res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
};




// ================================================================================================
// ================================================================================================
// Get all roles
const getAllRoles = async (req, res) => {
  try {
    const { page , limit  } = req.query; // Set default values

    const skip = (page - 1) * limit;

    // Fetch roles excluding 'Admin'
    const roles = await Role.find({ roles: { $ne: "Admin" } })
    .populate('name')  
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Count total roles excluding 'Admin'
    const total = await Role.countDocuments({ roles: { $ne: "Admin" } });

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      message: "Roles Fetched Successfully!",
      roles,
      pagination: {
        total,
        currentPage: parseInt(page),
        perPage: parseInt(limit),
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching roles:", error.message);
    res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
};



// ================================================================================================
// ================================================================================================
// Get a single role by ID
const getRoleById = async (req, res) => {
  try {
    const { _id } = req.query;

    const role = await Role.findById(_id)
    .populate("name");
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.status(200).json({ message: "Role Fetched Successfully!", role });
  } catch (error) {
    console.error("Error fetching role:", error.message);
    res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
};


// ================================================================================================
// ================================================================================================
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
