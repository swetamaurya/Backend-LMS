const ExcelJS = require("exceljs") 
const Student = require("../models/studentModel");
 
 
 
const importFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const buffer = req.file.buffer;
    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ message: "File buffer is empty or invalid." });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      return res.status(400).json({ message: "Invalid Excel file, no worksheet found." });
    }

    const userRows = [];
    const headers = [];

    // Extract headers
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      headers[colNumber] = cell.value ? cell.value.toString().trim() : null;
    });

    // Process each row
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) {
        const userData = {};
        
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber];
          if (!header) return;

          const key = header.toLowerCase().replace(/\s+/g, "_");

          // Extracting proper text from the cell value
          if (typeof cell.value === "object") {
            if (cell.value.richText) {
              userData[key] = cell.value.richText.map(rt => rt.text).join(" ").trim();
            } else if (cell.value.text) {
              userData[key] = cell.value.text.trim();
            } else if (cell.value.hyperlink) {
              userData[key] = cell.value.hyperlink.trim();
            }
          } else {
            userData[key] = cell.value ? cell.value.toString().trim() : "";
          }
        });

        userData["roles"] = "Students";

        if (Object.keys(userData).length > 0) {
          userRows.push(userData);
        }
      }
    });

    if (!userRows.length) {
      return res.status(400).json({ message: "Uploaded Excel file has no valid data." });
    }

    // Insert data into MongoDB
    const insertedUsers = await Student.insertMany(userRows);

    res.status(200).json({
      message: "Students Imported Successfully!",
      insertedUserRecords: insertedUsers.length,
      userData: insertedUsers,
    });
  } catch (error) {
    console.error("Error importing Excel file:", error.message);
    res.status(500).json({ message: "Internal server error: " + error.message });
  }
};




 


 





  
 
module.exports = importFromExcel