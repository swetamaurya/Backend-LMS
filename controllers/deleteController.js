const { Role } = require("../models/roleModel");
const User = require("../models/userModel");
   

const deleteAll = async (req, res) => {
    try {
      const { _id } = req.body;
  
      // Validate `_id` input
      if (!_id || (Array.isArray(_id) && _id.length === 0)) {
        return res.status(400).json({ message: "No _id provided for deletion." });
      }
  
      // Normalize single ID to an array
      const _idArray = Array.isArray(_id) ? _id : [_id];
  
      // Array of models to check for deletion
      const models = [
        { name: "User", model: User },
        { name: "Role", model: Role },
      ];
  
      let totalDeletedCount = 0;
      const deletionResults = [];
  
      // Loop through each model and attempt deletion
      for (const { name, model } of models) {
        const deletionResult = await model.deleteMany({ _id: { $in: _idArray } });
        if (deletionResult.deletedCount > 0) {
          totalDeletedCount += deletionResult.deletedCount;
          deletionResults.push({
            model: name,
            deletedCount: deletionResult.deletedCount,
          });
        }
      }
  
      // Check if any records were deleted
      if (totalDeletedCount === 0) {
        return res.status(404).json({
          message: "No records found for the provided ID(s) in any model.",
        });
      }
  
      // Return summary of deletion results
      return res.status(200).json({
        message: `${totalDeletedCount} records deleted successfully across models.`,
        deletionResults,
      });
    } catch (error) {
      console.error("Error deleting records:", error);
      return res
        .status(500)
        .json({ error: `Internal server error: ${error.message}` });
    }
  };

module.exports = deleteAll