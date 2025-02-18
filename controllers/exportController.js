const Role = require("../models/roleModel");
const Batch = require("../models/batchModel");
const Class = require("../models/classModel");
const Course = require("../models/courseModel");
const { User } = require("../models/userModel");
const ExcelJS = require("exceljs");
const BatchCategory = require("../models/batchCategoryModel");
const Student = require("../models/studentModel");
const courseCategory = require("../models/courseCategoryModel")
 


 

// const exportData = async (req, res) => {
//     const { page, limit } = req.query;
//     const { _id } = req.body;

//     try {
//         if (!_id || (Array.isArray(_id) && _id.length === 0)) {
//             return res.status(400).json({ error: "No _id provided for export." });
//         }

//         const _idArray = Array.isArray(_id) ? _id : [_id];

//         const models = [
//             { name: "User", model: User },
//             { name: "Role", model: Role },
//             { name: "Class", model: Class },
//             { name: "Batch", model: Batch },
//             { name: "Course", model: Course },
//             { name: "courseCategory", model: courseCategory },
//             { name: "BatchCategory", model: BatchCategory },
//             { name: "Student", model: Student }
//         ];

//         const skip = page ? (page - 1) * (limit || 10) : 0;
//         const parsedLimit = limit ? parseInt(limit) : 10;
//         const totalData = {};

//         for (const { name, model } of models) {
//             let query = model.find({ _id: { $in: _idArray } }).sort({ _id: -1 }).skip(skip).limit(parsedLimit);

//             if (name === "Batch") {
//                 query = query.populate("course").populate("enrollStudents");
//             } else if (name === "Class") {
//                 query = query.populate("batch").populate("instructor");
//             } else if (name === "Role") {
//                 query = query.populate("name");
//             } else if (name === "User") {
//                 query = query.populate("roles");
//             }

//             const data = await query;

//             if (data.length > 0) {
//                 totalData[name] = data;
//             }
//         }

//         if (Object.keys(totalData).length === 0) {
//             return res.status(404).json({ message: "No records found for the provided ID(s) across models." });
//         }

//         return generateExcelFile(res, totalData);
//     } catch (error) {
//         console.error("Error exporting data:", error);
//         return res.status(500).json({ error: `Internal server error: ${error.message}` });
//     }
// };

// const generateExcelFile = async (res, data) => {
//     const workbook = new ExcelJS.Workbook();

//     const flattenData = (entry) => {
//         const flatObject = {};
//         const excludeKeys = ["_id", "__v", "id"];

//         const processArray = (key, value, prefix = "") => {
//             value.forEach((item, index) => {
//                 Object.entries(item).forEach(([nestedKey, nestedValue]) => {
//                     if (!excludeKeys.includes(nestedKey)) {
//                         flatObject[`${prefix}${key}_${index + 1}_${nestedKey}`] =
//                             Array.isArray(nestedValue) ? nestedValue.join(", ") : nestedValue || "-";
//                     }
//                 });
//             });
//         };

//         for (const [key, value] of Object.entries(entry)) {
//             if (excludeKeys.includes(key)) continue;

//             if (Array.isArray(value)) {
//                 processArray(key, value);
//             } else if (typeof value === "object" && value !== null) {
//                 Object.entries(value).forEach(([nestedKey, nestedValue]) => {
//                     if (!excludeKeys.includes(nestedKey)) {
//                         flatObject[`${key}_${nestedKey}`] =
//                             Array.isArray(nestedValue) ? nestedValue.join(", ") : nestedValue || "-";
//                     }
//                 });
//             } else {
//                 flatObject[key] = value || "-";
//             }
//         }
//         return flatObject;
//     };

//     for (const [modelName, modelData] of Object.entries(data)) {
//         const worksheet = workbook.addWorksheet(modelName);
//         const flatData = modelData.map((item) => flattenData(item.toObject ? item.toObject() : item));

//         const formatHeader = (header) =>
//             header.replace(/_/g, " ").replace(/\b\w/g, (char, index) => (index === 0 ? char.toUpperCase() : char.toLowerCase()));

//         worksheet.columns = Object.keys(flatData[0] || {}).map((key) => ({
//             header: formatHeader(key),
//             key: key,
//             width: 20,
//         }));

//         worksheet.getRow(1).eachCell((cell) => {
//             cell.font = { bold: true, color: { argb: "FFFFFF" } }; // White text
//             cell.fill = {
//                 type: "pattern",
//                 pattern: "solid",
//                 fgColor: { argb: "4472C4" }, // Dark blue background
//             };
//             cell.alignment = { horizontal: "center", vertical: "middle" };
//         });

//         flatData.forEach((item) => worksheet.addRow(item));

//         worksheet.addRow({});
//         const totalRow = worksheet.addRow({ Total_Records: flatData.length });

//         totalRow.getCell(1).font = { bold: true };
//         totalRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
//         totalRow.getCell(1).fill = {
//             type: "pattern",
//             pattern: "solid",
//             fgColor: { argb: "A9D08E" }, // Light green background
//         };

//         worksheet.getRow(1).height = 20;
//     }

//     res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//     res.setHeader("Content-Disposition", 'attachment; filename="exported-data.xlsx"');

//     await workbook.xlsx.write(res);
//     res.end();
// };

  
 
const exportData = async (req, res) => {
    const { page, limit } = req.query;
    const { _id } = req.body;

        try {
        if (!_id || (Array.isArray(_id) && _id.length === 0)) {
            return res.status(400).json({ error: "No _id provided for export." });
        }

        const _idArray = Array.isArray(_id) ? _id : [_id];

        const models = [
            { name: "Student", model: Student },
            {name :"BatchCategory", model: BatchCategory}

        ];

        const skip = page ? (page - 1) * (limit || 10) : 0;
        const parsedLimit = limit ? parseInt(limit) : 10;
        const totalData = {};

        for (const { name, model } of models) {
      let query = model.find({ _id: { $in: _idArray } }).sort({ _id: -1 }).skip(skip).limit(parsedLimit);

            if (name === "BatchCategory") {
            query = query.populate("student")
            
           } 
            if (_id && (!Array.isArray(_id) || _id.length > 0)) {
                const _idArray = Array.isArray(_id) ? _id : [_id];
                query = query.where('_id').in(_idArray);
            }

            const data = await query
            
            if (data.length > 0) {
                totalData[name] = data;
            }
        }

        if (Object.keys(totalData).length === 0) {
            return res.status(404).json({ message: "No records found." });
        }

        return generateExcelFile(res, totalData);
    } catch (error) {
        console.error("Error exporting data:", error);
        return res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
};


const generateExcelFile = async (res, data) => {
    const workbook = new ExcelJS.Workbook();

    const flattenData = (entry) => {
        const flatObject = {};
        const excludeKeys = ["_id", "__v", "id", "password"];

        const processArray = (key, value, prefix = "") => {
            value.forEach((item, index) => {
                Object.entries(item).forEach(([nestedKey, nestedValue]) => {
                    if (!excludeKeys.includes(nestedKey)) {
                        flatObject[`${prefix}${key}_${index + 1}_${nestedKey}`] =
                            Array.isArray(nestedValue) ? nestedValue.join(", ") : nestedValue || "-";
                    }
                });
            });
        };

        for (const [key, value] of Object.entries(entry)) {
            if (excludeKeys.includes(key)) continue;

            if (Array.isArray(value)) {
                processArray(key, value);
            } else if (typeof value === "object" && value !== null) {
                Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                    if (!excludeKeys.includes(nestedKey)) {
                        flatObject[`${key}_${nestedKey}`] =
                            Array.isArray(nestedValue) ? nestedValue.join(", ") : nestedValue || "-";
                    }
                });
            } else {
                flatObject[key] = value || "-";
            }
        }
        return flatObject;
    };

    for (const [modelName, modelData] of Object.entries(data)) {
        const worksheet = workbook.addWorksheet(modelName);
        const flatData = modelData.map((item) => flattenData(item.toObject ? item.toObject() : item));

        const formatHeader = (header) =>
            header.replace(/_/g, " ").replace(/\b\w/g, (char, index) => (index === 0 ? char.toUpperCase() : char.toLowerCase()));

        worksheet.columns = Object.keys(flatData[0] || {}).map((key) => ({
            header: formatHeader(key),
            key: key,
            width: 20,
        }));

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: "FFFFFF" } }; // White text
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "3e80f9" }, // Dark blue background
            };
            cell.alignment = { horizontal: "center", vertical: "middle" };
        });

        flatData.forEach((item) => worksheet.addRow(item));

        worksheet.addRow({});
        const totalRow = worksheet.addRow({ Total_Records: flatData.length });

        totalRow.getCell(1).font = { bold: true };
        totalRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
        totalRow.getCell(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "3e80f9" }, // Light green background
        };

        worksheet.getRow(1).height = 20;
    }

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="exported-data.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
}; 

  module.exports = exportData