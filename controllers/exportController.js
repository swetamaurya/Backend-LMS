const Role = require("../models/roleModel");
const Batch = require("../models/batchModel");
const Class = require("../models/classModel");
const Course = require("../models/courseModel");
const {User} = require("../models/userModel");
const ExcelJS = require("exceljs");
const BatchCategory = require("../models/batchCategoryModel");
const Student = require("../models/studentModel");
// { name: "courseCategory", model: courseCategory },


// Route to export data
const exportData =  async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    // const { roles } = req.user;
    const { _id } = req.body;
  
    try {
      if (!_id || (Array.isArray(_id) && _id.length === 0)) {
        return res.status(400).json({ error: "No _id provided for export." });
      }
  
      const _idArray = Array.isArray(_id) ? _id : [_id];
  
      const models = [
        { name: "User", model: User },
        { name: "Role", model: Role },
        { name: "Class", model: Class },
        { name: "Batch", model: Batch },
        { name: "Course", model: Course },
      ];
  
      const skip = (page - 1) * limit;
      const totalData = {};
  
      for (const { name, model } of models) {
        let query = model.find({ _id: { $in: _idArray } }).sort({_id:-1}).skip(skip).limit(parseInt(limit));
  
        // Dynamically apply populate based on the model
        if (name === "Batch") {
          query = query
          .populate("course" )
          .populate("enrollStudents")  

        } else if (name === "Class") {
          query = query
            .populate("batch" ) // Include all relevant client fields
            .populate("instructor" ) // Include all relevant project fields
         
         }   
         else if (name === "Role") {
            query = query
              .populate("name" ) // Include all relevant client fields
            
           }
           else if (name === "User") {
            query = query
              .populate("roles" ) // Include all relevant client fields
            
           }
  
        const data = await query;
  
        if (data.length > 0) {
          totalData[name] = data;
        }
      }
  
      if (Object.keys(totalData).length === 0) {
        return res.status(404).json({ message: "No records found for the provided ID(s) across models." });
      }
  
      return generateExcelFile(res, totalData);
    } catch (error) {
      console.error("Error exporting data:", error);
      return res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
  }
  

  

const generateExcelFile = async (res, data) => {
    const workbook = new ExcelJS.Workbook();
  
    // Function to flatten nested objects and arrays
    const flattenData = (entry) => {
      const flatObject = {};
      const excludeKeys = ["_id", "__v", "id"]; // Excluded keys globally
  
      const processArray = (key, value, prefix = "") => {
        value.forEach((item, index) => {
          Object.entries(item).forEach(([nestedKey, nestedValue]) => {
            if (!excludeKeys.includes(nestedKey)) {
              if (nestedKey === "createdBy" && typeof nestedValue === "object" && nestedValue !== null) {
                // Special processing for "createdBy" object
                flatObject[`${prefix}${key}_${index + 1}_Name`] = nestedValue.name || "-";
                flatObject[`${prefix}${key}_${index + 1}_Email`] = nestedValue.email || "-";
                flatObject[`${prefix}${key}_${index + 1}_RoleId`] = nestedValue.roleId || "-";
              } else {
                flatObject[`${prefix}${key}_${index + 1}_${nestedKey}`] =
                  Array.isArray(nestedValue) ? nestedValue.join(", ") : nestedValue || "-";
              }
            }
          });
        });
      };
  
      for (const [key, value] of Object.entries(entry)) {
        if (excludeKeys.includes(key)) continue; // Skip excluded fields
  
        if (key === "createdBy" && typeof value === "object" && value !== null) {
          // Handle "createdBy" separately
          flatObject["Name"] = value.name || "-";
          flatObject["Email"] = value.email || "-";
          flatObject["Role Id"] = value.roleId || "-";
        } else if (Array.isArray(value)) {
          processArray(key, value);
        } else if (typeof value === "object" && value !== null) {
          // Flatten nested objects
          Object.entries(value).forEach(([nestedKey, nestedValue]) => {
            if (!excludeKeys.includes(nestedKey)) {
              flatObject[`${key}_${nestedKey}`] = Array.isArray(nestedValue)
                ? nestedValue.join(", ")
                : nestedValue || "-";
            }
          });
        } else {
          flatObject[key] = value || "-"; // Handle primitive values
        }
      }
      return flatObject;
    };
  
    // Iterate through models in the provided data
    for (const [modelName, modelData] of Object.entries(data)) {
      const worksheet = workbook.addWorksheet(modelName);
      const flatData = modelData.map((item) => flattenData(item.toObject ? item.toObject() : item));
  
      // Format header names
      const formatHeader = (header) =>
        header
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char, index) => (index === 0 ? char.toUpperCase() : char.toLowerCase()));
  
      // Define worksheet columns
      worksheet.columns = Object.keys(flatData[0] || {}).map((key) => ({
        header: formatHeader(key),
        key: key,
        width: 20, // Column width
      }));
  
      // Apply header styles (bold, white text, orange background)
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "#ecf2fe" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "#ecf2fe" }, // Orange background
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });
  
      // Add data rows
      flatData.forEach((item) => worksheet.addRow(item));
  
      // Add a space row and total records row
      worksheet.addRow({});
      const totalRow = worksheet.addRow({ Total_Records: flatData.length });
  
      // Style the total records row
      totalRow.getCell(1).font = { bold: true };
      totalRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
      totalRow.getCell(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "#ecf2fe" }, // Light blue background
      };
  
      // Adjust row height for headers
      worksheet.getRow(1).height = 20;
    }
  
  // Set response headers for binary file
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", 'attachment; filename="exported-data.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  };
 
  

  module.exports = exportData