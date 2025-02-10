const {User , Sequence} = require('../model/userModel');
const moment = require("moment")
const ExcelJS = require("exceljs")
const fs = require("fs-extra");
const mongoose = require("mongoose")
 const Leaves = require("../model/leaveModel");
const { Visit ,Remark} = require("../model/visitModel");
 const Department = require("../model/departmentModel");
const { Product ,  Category} = require("../model/productModel");
 

 

// Function to get the next sequence value for userId
async function getNextSequenceValue(type) {
  const prefixMap = {
    Admin: "ADM",
    Employee: "EMP",
    Manager: "MMG",
    Doctor: "DR",
    HR: "HR",
    Chemist: "CHM",
  };
  const prefix = prefixMap[type] || "USR";

  try {
    const sequenceDoc = await Sequence.findOneAndUpdate(
      { seqName: type },
      { $inc: { seqValue: 1 } },
      { new: true, upsert: true }
    );
    const sequenceNumber = sequenceDoc.seqValue.toString().padStart(4, "0");
    return `${prefix}-${sequenceNumber}`;
  } catch (error) {
    throw new Error("Error generating sequence value: " + error.message);
  }
}

 const getFormattedDate = (date) => {
  const allowedFormats = ["YYYY-MM-DD", "DD-MM-YYYY"];
  if (!moment(date, allowedFormats, true).isValid()) {
    throw new Error("Invalid date format. Please provide a valid date in 'YYYY-MM-DD' or 'DD-MM-YYYY' format.");
  }
  return moment(date, allowedFormats).format("DD-MM-YYYY");
};

const getAdminDashboard = async (req, res) => {
  try {
    const today = moment().startOf("day");
    const yesterday = moment().subtract(1, "day").startOf("day");
    const startOfWeek = moment().startOf("week");
    const startOfLastWeek = moment().subtract(1, "week").startOf("week");
    const startOfMonth = moment().startOf("month");
    const startOfLastMonth = moment().subtract(1, "month").startOf("month");
    const startOfYear = moment().startOf("year");
    const startOfLastYear = moment().subtract(1, "year").startOf("year");

    // Helper function to calculate increments
    const calculateIncrement = (current, previous) => current - previous;

      // Helper function to calculate average coverage
      const calculateAverageCoverage = (completed, total) => {
        return total > 0 ? ((completed / total) * 100).toFixed(2) : 0;
      };

    // Doctor Visits
    const doctorVisitCounts = {
      scheduled: {
        today: await Visit.countDocuments({ visitDoctor: { $exists: true }, visitDate: today.format("DD-MM-YYYY") }),
        yesterday: await Visit.countDocuments({ visitDoctor: { $exists: true }, visitDate: yesterday.format("DD-MM-YYYY") }),
        thisWeek: await Visit.countDocuments({ visitDoctor: { $exists: true }, visitDate: { $gte: startOfWeek.format("DD-MM-YYYY") } }),
        lastWeek: await Visit.countDocuments({ visitDoctor: { $exists: true }, visitDate: { $gte: startOfLastWeek.format("DD-MM-YYYY"), $lt: startOfWeek.format("DD-MM-YYYY") } }),
        thisMonth: await Visit.countDocuments({ visitDoctor: { $exists: true }, visitDate: { $gte: startOfMonth.format("DD-MM-YYYY") } }),
        lastMonth: await Visit.countDocuments({ visitDoctor: { $exists: true }, visitDate: { $gte: startOfLastMonth.format("DD-MM-YYYY"), $lt: startOfMonth.format("DD-MM-YYYY") } }),
        thisYear: await Visit.countDocuments({ visitDoctor: { $exists: true }, visitDate: { $gte: startOfYear.format("DD-MM-YYYY") } }),
        lastYear: await Visit.countDocuments({ visitDoctor: { $exists: true }, visitDate: { $gte: startOfLastYear.format("DD-MM-YYYY"), $lt: startOfYear.format("DD-MM-YYYY") } }),
      },
      closed: {
        today: await Visit.countDocuments({ visitDoctor: { $exists: true }, visitDate: today.format("DD-MM-YYYY"), status: "Success" }),
        yesterday: await Visit.countDocuments({ visitDoctor: { $exists: true }, visitDate: yesterday.format("DD-MM-YYYY"), status: "Success" }),
        thisWeek: await Visit.countDocuments({ visitDoctor: { $exists: true }, visitDate: { $gte: startOfWeek.format("DD-MM-YYYY") }, status: "Success" }),
        lastWeek: await Visit.countDocuments({ visitDoctor: { $exists: true }, visitDate: { $gte: startOfLastWeek.format("DD-MM-YYYY"), $lt: startOfWeek.format("DD-MM-YYYY") }, status: "Success" }),
        thisMonth: await Visit.countDocuments({ visitDoctor: { $exists: true }, visitDate: { $gte: startOfMonth.format("DD-MM-YYYY") }, status: "Success" }),
        lastMonth: await Visit.countDocuments({ visitDoctor: { $exists: true }, visitDate: { $gte: startOfLastMonth.format("DD-MM-YYYY"), $lt: startOfMonth.format("DD-MM-YYYY") }, status: "Success" }),
        thisYear: await Visit.countDocuments({ visitDoctor: { $exists: true }, visitDate: { $gte: startOfYear.format("DD-MM-YYYY") }, status: "Success" }),
        lastYear: await Visit.countDocuments({ visitDoctor: { $exists: true }, visitDate: { $gte: startOfLastYear.format("DD-MM-YYYY"), $lt: startOfYear.format("DD-MM-YYYY") }, status: "Success" }),
      },
    };

    // Log counts for debugging
    // console.log("Doctor Visits (Scheduled):", doctorVisitCounts.scheduled);
    // console.log("Doctor Visits (Closed):", doctorVisitCounts.closed);

    // Chemist Visits
    const chemistVisitCounts = {
      scheduled: {
        today: await Visit.countDocuments({ visitChemist: { $exists: true }, visitDate: today.format("DD-MM-YYYY") }),
        yesterday: await Visit.countDocuments({ visitChemist: { $exists: true }, visitDate: yesterday.format("DD-MM-YYYY") }),
        thisWeek: await Visit.countDocuments({ visitChemist: { $exists: true }, visitDate: { $gte: startOfWeek.format("DD-MM-YYYY") } }),
        lastWeek: await Visit.countDocuments({ visitChemist: { $exists: true }, visitDate: { $gte: startOfLastWeek.format("DD-MM-YYYY"), $lt: startOfWeek.format("DD-MM-YYYY") } }),
        thisMonth: await Visit.countDocuments({ visitChemist: { $exists: true }, visitDate: { $gte: startOfMonth.format("DD-MM-YYYY") } }),
        lastMonth: await Visit.countDocuments({ visitChemist: { $exists: true }, visitDate: { $gte: startOfLastMonth.format("DD-MM-YYYY"), $lt: startOfMonth.format("DD-MM-YYYY") } }),
        thisYear: await Visit.countDocuments({ visitChemist: { $exists: true }, visitDate: { $gte: startOfYear.format("DD-MM-YYYY") } }),
        lastYear: await Visit.countDocuments({ visitChemist: { $exists: true }, visitDate: { $gte: startOfLastYear.format("DD-MM-YYYY"), $lt: startOfYear.format("DD-MM-YYYY") } }),
      },
      closed: {
        today: await Visit.countDocuments({ visitChemist: { $exists: true }, visitDate: today.format("DD-MM-YYYY"), status: "Success" }),
        yesterday: await Visit.countDocuments({ visitChemist: { $exists: true }, visitDate: yesterday.format("DD-MM-YYYY"), status: "Success" }),
        thisWeek: await Visit.countDocuments({ visitChemist: { $exists: true }, visitDate: { $gte: startOfWeek.format("DD-MM-YYYY") }, status: "Success" }),
        lastWeek: await Visit.countDocuments({ visitChemist: { $exists: true }, visitDate: { $gte: startOfLastWeek.format("DD-MM-YYYY"), $lt: startOfWeek.format("DD-MM-YYYY") }, status: "Success" }),
        thisMonth: await Visit.countDocuments({ visitChemist: { $exists: true }, visitDate: { $gte: startOfMonth.format("DD-MM-YYYY") }, status: "Success" }),
        lastMonth: await Visit.countDocuments({ visitChemist: { $exists: true }, visitDate: { $gte: startOfLastMonth.format("DD-MM-YYYY"), $lt: startOfMonth.format("DD-MM-YYYY") }, status: "Success" }),
        thisYear: await Visit.countDocuments({ visitChemist: { $exists: true }, visitDate: { $gte: startOfYear.format("DD-MM-YYYY") }, status: "Success" }),
        lastYear: await Visit.countDocuments({ visitChemist: { $exists: true }, visitDate: { $gte: startOfLastYear.format("DD-MM-YYYY"), $lt: startOfYear.format("DD-MM-YYYY") }, status: "Success" }),
      },
    };

    // Log counts for debugging
    // console.log("Chemist Visits (Scheduled):", chemistVisitCounts.scheduled);
    // console.log("Chemist Visits (Closed):", chemistVisitCounts.closed);

    // Leaves
    const totalLeaves = await Leaves.countDocuments();
console.log(totalLeaves)
    // Employees
    const leave = await Leaves.find().populate("name","name").sort( { _id: 1 });
 // Total scheduled visits
 const totalScheduledVisits = {
  all: await Visit.countDocuments(),
  today: await Visit.countDocuments({ visitDate: today.format("DD-MM-YYYY") }),
  thisWeek: await Visit.countDocuments({ visitDate: { $gte: startOfWeek.format("DD-MM-YYYY") } }),
  thisMonth: await Visit.countDocuments({ visitDate: { $gte: startOfMonth.format("DD-MM-YYYY") } }),
  thisYear: await Visit.countDocuments({ visitDate: { $gte: startOfYear.format("DD-MM-YYYY") } }),
};

// Total completed visits
const totalCompletedVisits = {
  all: await Visit.countDocuments({ status: "Success" }),
  today: await Visit.countDocuments({ visitDate: today.format("DD-MM-YYYY"), status: "Success" }),
  thisWeek: await Visit.countDocuments({ visitDate: { $gte: startOfWeek.format("DD-MM-YYYY") }, status: "Success" }),
  thisMonth: await Visit.countDocuments({ visitDate: { $gte: startOfMonth.format("DD-MM-YYYY") }, status: "Success" }),
  thisYear: await Visit.countDocuments({ visitDate: { $gte: startOfYear.format("DD-MM-YYYY") }, status: "Success" }),
};
    // Average Company Coverage Placeholder
  // Calculate average company coverage
    const averageCompanyCoverage = {
      all: calculateAverageCoverage(totalCompletedVisits.all, totalScheduledVisits.all),
      today: calculateAverageCoverage(totalCompletedVisits.today, totalScheduledVisits.today),
      thisWeek: calculateAverageCoverage(totalCompletedVisits.thisWeek, totalScheduledVisits.thisWeek),
      thisMonth: calculateAverageCoverage(totalCompletedVisits.thisMonth, totalScheduledVisits.thisMonth),
      thisYear: calculateAverageCoverage(totalCompletedVisits.thisYear, totalScheduledVisits.thisYear),
    };
    // Combine Data
    const dashboardData = {
      
        "Doctor’s visit schedule": {
          all: { value: doctorVisitCounts.scheduled.thisYear, increment: calculateIncrement(doctorVisitCounts.scheduled.thisYear, doctorVisitCounts.scheduled.lastYear) },
          today: { value: doctorVisitCounts.scheduled.today, increment: calculateIncrement(doctorVisitCounts.scheduled.today, doctorVisitCounts.scheduled.yesterday) },
          thisWeek: { value: doctorVisitCounts.scheduled.thisWeek, increment: calculateIncrement(doctorVisitCounts.scheduled.thisWeek, doctorVisitCounts.scheduled.lastWeek) },
          thisMonth: { value: doctorVisitCounts.scheduled.thisMonth, increment: calculateIncrement(doctorVisitCounts.scheduled.thisMonth, doctorVisitCounts.scheduled.lastMonth) },
          thisYear: { value: doctorVisitCounts.scheduled.thisYear, increment: calculateIncrement(doctorVisitCounts.scheduled.thisYear, doctorVisitCounts.scheduled.lastYear) },
        },
        "Doctor’s visit closed": {
          all: { value: doctorVisitCounts.closed.thisYear, increment: calculateIncrement(doctorVisitCounts.closed.thisYear, doctorVisitCounts.closed.lastYear) },
          today: { value: doctorVisitCounts.closed.today, increment: calculateIncrement(doctorVisitCounts.closed.today, doctorVisitCounts.closed.yesterday) },
          thisWeek: { value: doctorVisitCounts.closed.thisWeek, increment: calculateIncrement(doctorVisitCounts.closed.thisWeek, doctorVisitCounts.closed.lastWeek) },
          thisMonth: { value: doctorVisitCounts.closed.thisMonth, increment: calculateIncrement(doctorVisitCounts.closed.thisMonth, doctorVisitCounts.closed.lastMonth) },
          thisYear: { value: doctorVisitCounts.closed.thisYear, increment: calculateIncrement(doctorVisitCounts.closed.thisYear, doctorVisitCounts.closed.lastYear) },
        },
        "Chemist’s visit schedule": {
          all: { value: chemistVisitCounts.scheduled.thisYear, increment: calculateIncrement(chemistVisitCounts.scheduled.thisYear, chemistVisitCounts.scheduled.lastYear) },
          today: { value: chemistVisitCounts.scheduled.today, increment: calculateIncrement(chemistVisitCounts.scheduled.today, chemistVisitCounts.scheduled.yesterday) },
          thisWeek: { value: chemistVisitCounts.scheduled.thisWeek, increment: calculateIncrement(chemistVisitCounts.scheduled.thisWeek, chemistVisitCounts.scheduled.lastWeek) },
          thisMonth: { value: chemistVisitCounts.scheduled.thisMonth, increment: calculateIncrement(chemistVisitCounts.scheduled.thisMonth, chemistVisitCounts.scheduled.lastMonth) },
          thisYear: { value: chemistVisitCounts.scheduled.thisYear, increment: calculateIncrement(chemistVisitCounts.scheduled.thisYear, chemistVisitCounts.scheduled.lastYear) },
        },
        "Chemist’s visit closed": {
          all: { value: chemistVisitCounts.closed.thisYear, increment: calculateIncrement(chemistVisitCounts.closed.thisYear, chemistVisitCounts.closed.lastYear) },
          today: { value: chemistVisitCounts.closed.today, increment: calculateIncrement(chemistVisitCounts.closed.today, chemistVisitCounts.closed.yesterday) },
          thisWeek: { value: chemistVisitCounts.closed.thisWeek, increment: calculateIncrement(chemistVisitCounts.closed.thisWeek, chemistVisitCounts.closed.lastWeek) },
          thisMonth: { value: chemistVisitCounts.closed.thisMonth, increment: calculateIncrement(chemistVisitCounts.closed.thisMonth, chemistVisitCounts.closed.lastMonth) },
          thisYear: { value: chemistVisitCounts.closed.thisYear, increment: calculateIncrement(chemistVisitCounts.closed.thisYear, chemistVisitCounts.closed.lastYear) },
        },
        "Total leaves": {
          all: { value: totalLeaves, increment: 0 },
          today: { value: totalLeaves, increment: 0 },
          thisWeek: { value: totalLeaves, increment: 0 },
          thisMonth: { value: totalLeaves, increment: 0 },
          thisYear: { value: totalLeaves, increment: 0 },
        },
        "Average company coverage": {
          all: { value: averageCompanyCoverage.all, increment: 0 },
          today: { value: averageCompanyCoverage.today, increment: 0 },
          thisWeek: { value: averageCompanyCoverage.thisWeek, increment: 0 },
          thisMonth: { value: averageCompanyCoverage.thisMonth, increment: 0 },
          thisYear: { value: averageCompanyCoverage.thisYear, increment: 0 },
        },
        leave ,  

    };

    res.status(200).json({
      message: "Dashboard data fetched successfully.",
      data: dashboardData,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error.message);
    res.status(500).json({
      error: "Internal server error while fetching dashboard data.",
    });
  }
};
 





 
 
 
const importFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const buffer = req.file.buffer;
    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ message: "File buffer is empty or invalid." });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];
    // const rows = [];
    const userRows = [];
    const productRows = [];

    // Map Excel headings to model field names
    const headerMap = {
       "Doctor's Name": "name",
       "Employee Name": "name",
       "Chemist's Name": "name",
       "Product Name": "name",
       "Address": "area",
      "Hospital": "area",
      "Speciality": "speciality",
      "Category": "category",
      "Visit Frequency": "visitFrequency",
      "Roles": "roles",
      "Email": "email",
      "phone": "phone",
      "Status": "status",
      "Product Category":"category",
      "Speciality":"speciality",
      "Employee Shift Start Time":"shiftStart",
      "Employee Shift End Time":"shiftEnd",
      "Department":"departments",
      "Designation":"designations",
      "Doctor Time 1": "doctor_time1",
       "Doctor Time 2": "doctor_time2", 
       "Chemist Time 1": "chemist_time1",
       "Chemist Time 2": "chemist_time2", 
        "Joining Date": "joiningDate",
       "Onboarding" : "onboarding",
       "KM":"km"
    };
    const headerMap2 = {
      
      "Product Name": "name",
    
     
     "Status": "status",
     "Category Name":"category",
 
      
   };

   worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber > 1) { // Skip the header row
      const userData = {};
      const productData = {};
  
      row.eachCell((cell, colNumber) => {
        const header = worksheet.getRow(1).getCell(colNumber).value;
  
        // Check if the row corresponds to User data
        const userHeader = headerMap[header?.trim()];
        if (userHeader) {
          if (
            userHeader === "email" &&
            typeof cell.value === "object" &&
            cell.value.text
          ) {
            userData[userHeader] = cell.value.text; // Extract text if email is an object
          } else if (
            userHeader === "email" &&
            typeof cell.value === "object" &&
            cell.value.hyperlink
          ) {
            userData[userHeader] = cell.value.hyperlink.replace("mailto:", ""); // Handle email hyperlinks
          } else {
            userData[userHeader] = cell.value; // Default handling
          }
        }
  
        // Check if the row corresponds to Product data
        const productHeader = headerMap2[header?.trim()];
        if (productHeader) {
          productData[productHeader] = cell.value;
        }
      });
  
      // Add to userRows if there is at least one valid user field
      if (Object.keys(userData).length > 0 && userData.roles) {
        userRows.push(userData);
      }
  
      // Add to productRows if there is at least one valid product field
      if (Object.keys(productData).length > 0 && productData.name) {
        productRows.push(productData);
      }
    }
  });
  

  if (!userRows.length && !productRows.length) {
    return res.status(400).json({ message: "Uploaded Excel file is empty." });
  }

    // Define roles that require department mapping
    const rolesRequiringDepartment = ["Employee", "Manager", "HR"];

     // Process user rows
    const processedUserRows = await Promise.all(
      userRows.map(async (row) => {
        if (row.roles) {
          row.userId = await getNextSequenceValue(row.roles); // Generate ID based on role
        }

        if (rolesRequiringDepartment.includes(row.roles) && row.departments) {
          const department = await Department.findOne({ name: row.departments.trim() });
          if (!department) {
            throw new Error(`Department "${row.departments}" not found in the database.`);
          }
          row.departments = department._id;
        }

        return row;
      })
    );

    // Process rows to handle product categories and other fields
const processedProductRows = await Promise.all(
  productRows.map(async (row) => {
    if (row.category) {
      const category = await Category.findOne({ name: row.category.trim() }); // Find category by name
      if (!category) {
        throw new Error(`Category "${row.category}" not found in the database.`);
      }
      row.category = category._id; // Replace category name with its ObjectId
    }
    return row;
  })
);

 
      // Insert data into User and Product models
      const insertedUsers = userRows.length > 0 ? await User.insertMany(processedUserRows) : [];
      const insertedProducts = processedProductRows.length > 0 ? await Product.insertMany(processedProductRows) : [];
  
      res.status(200).json({
        message: "File Processed Successfully!",
        insertedUserRecords: insertedUsers.length,
        insertedProductRecords: insertedProducts.length,
        userData: insertedUsers,
        productData: insertedProducts,
      });
    } catch (error) {
      console.error("Error importing Excel file:", error.message);
      res.status(500).json({ message: "Internal server error: " + error.message });
    }
  };

  
// Generate Excel File
const generateExcelFile = async (res, totalData) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data Export");

    // Extract the first dataset
    const dataset = totalData[Object.keys(totalData)[0]];

    if (dataset.length === 0) {
      return res.status(400).json({ message: "No data to export." });
    }

    // Format dates for cleaner output
    const formatDates = (data) => {
      return data.map((item) => {
        for (const key in item) {
          if (key.toLowerCase().includes("date") || key.toLowerCase().includes("createdat") || key.toLowerCase().includes("updatedat")|| key.toLowerCase().includes("doctor_time")|| key.toLowerCase().includes("onboarding")) {
            const dateValue = new Date(item[key]);
            if (!isNaN(dateValue)) {
              item[key] = dateValue.toISOString().split("T")[0]; // Format to DD-MM-YYYY
            }
          }
        }
        return item;
      });
    };

    const formattedDataset = formatDates(dataset);

    // Capitalize the first letter of each header
    const capitalizeHeader = (header) => {
      return header.charAt(0).toUpperCase() + header.slice(1);
    };

    const headers = Object.keys(formattedDataset[0]).map((header) => capitalizeHeader(header));
    worksheet.columns = headers.map((header, index) => ({
      header,
      key: Object.keys(formattedDataset[0])[index],
    }));

    // Add rows for the dataset
    worksheet.addRows(formattedDataset);

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=export.xlsx");
    res.send(buffer);
  } catch (error) {
    console.error("Error generating Excel file:", error.message);
    res.status(500).json({ message: "Internal server error: " + error.message });
  }
};



 
// Export functionality
const exportFile = async (req, res) => {
  const { page = 1, limit = 10, modelName } = req.query;
  const { _id } = req.body;

  try {
    // Validate modelName
    if (!modelName) {
      return res.status(400).json({ error: "Model name is required as a query parameter." });
    }

    // Validate if the model exists
    const Model = mongoose.models[modelName];
    if (!Model) {
      return res.status(400).json({ error: `Model '${modelName}' is not registered in Mongoose.` });
    }

    // Validate _id
    if (!_id || (Array.isArray(_id) && _id.length === 0)) {
      return res.status(400).json({ error: "No _id provided for export." });
    }

    const _idArray = Array.isArray(_id) ? _id : [_id];
    const skip = (page - 1) * limit;

    // Fetch data
    const query = Model.find({ _id: { $in: _idArray } })
 
    .sort({ _id: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    if (modelName === "User") {
      query.populate('departments', 'name'); // Populate `departments` for User model
    } else if (modelName === "Product") {
      query.populate('category', 'name') ; // Populate `category` for Product model
    }

    const data = await query;

    if (data.length === 0) {
      return res.status(404).json({ message: "No records found for the provided ID(s)." });
    }

    // Sanitize data
    const sanitizedData = data.map((item) => {
      // Convert Mongoose document to a plain object
      const sanitizedItem = item.toObject();
    
      // Remove unwanted internal fields
      Object.keys(sanitizedItem).forEach((key) => {
        if (key.startsWith('$') || key === '__v' || key === '_id') {
          delete sanitizedItem[key];
        }
      });
    
      // Replace ObjectIds with names for populated fields
      if (sanitizedItem.departments && sanitizedItem.departments.name) {
        sanitizedItem.departments = sanitizedItem.departments.name;
      }
      if (sanitizedItem.category && sanitizedItem.category.name) {
        sanitizedItem.category = sanitizedItem.category.name;
      }
    
      return sanitizedItem;
    });
    
    const totalData = { [modelName]: sanitizedData };
    return generateExcelFile(res, totalData);
  } catch (error) {
    console.error("Error exporting data:", error.message);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};


  
const getEmployeeCoverage = async (req, res) => {
  try {
      const { employeeId, from, to, preference, doctorChemistId } = req.query;

      // Log incoming parameters for debugging
      console.log("Incoming Parameters:", {
          employeeId,
          from,
          to,
          preference,
          doctorChemistId,
      });

      // Date filters
      // const startDate = from ? moment(from, ["YYYY-MM-DD", "DD-MM-YYYY"]).startOf("day") : null;
      // const endDate = to ? moment(to, ["YYYY-MM-DD", "DD-MM-YYYY"]).endOf("day") : null;

      const dateFilter = from && to
          ? { visitDate: { $gte: from, $lte: to } }
          : {};

      // console.log("Date Filter:", dateFilter);

      // Base query for visits
      const visitQuery = {
          ...dateFilter,
          ...(employeeId ? { $or: [{ createdBy: employeeId }, { assignedTo: employeeId }] } : {}),
          ...(doctorChemistId
            ? {
                $or: [
                  { visitDoctor: doctorChemistId },
                  { visitChemist: { $elemMatch: { $eq: doctorChemistId } } },
                ],
              }
            : {}),
        };      

      console.log("Visit Query:", visitQuery);

      // Fetch visits based on query
      let visits = await Visit.find(visitQuery)
          .populate({
              path: "visitDoctor",
              select: "name userId visitFrequency roles",
          })
          .populate({
              path: "visitChemist",
              select: "name userId visitFrequency roles",
          })
          .populate({
              path: "assignedTo",
              select: "name userId visitFrequency roles",
          })
          .populate({
              path: "createdBy",
              select: "name userId visitFrequency roles",
          });

      // console.log("Visits Found:", visits);

      // Filter visits by doctorChemistId and chemistId if provided
      if (doctorChemistId) {
          visits = visits.filter(
              (visit) =>
                  (visit.visitDoctor && visit.visitDoctor._id.toString() === doctorChemistId) ||
                  (visit.visitChemist && visit.visitChemist._id.toString() === doctorChemistId)
          );
          // console.log("Filtered Visits by doctorChemistId:", visits);
      }

      // Filter visits by preference (Doctor or Chemist)
      let filteredVisits = visits;
      if (preference === "Doctor") {
          filteredVisits = visits.filter((visit) => visit.visitDoctor);
      } else if (preference === "Chemist") {
          filteredVisits = visits.filter((visit) => visit.visitChemist);
      }

      // console.log("Filtered Visits by Preference:", filteredVisits);

      // Frequency count
      const doctorFrequency = filteredVisits.reduce((sum, visit) => sum + (visit.visitDoctor?.visitFrequency || 0), 0);
      const chemistFrequency = filteredVisits.reduce((sum, visit) => sum + (visit.visitChemist?.visitFrequency || 0), 0);

      // Task count
      const totalTasks = filteredVisits.length;

      // Visit status counts
      const doctorVisitScheduleCount = filteredVisits.filter(
          (visit) => visit.visitDoctor && visit.status === "Pending"
      ).length;
      const chemistVisitScheduleCount = filteredVisits.filter(
          (visit) => visit.visitChemist && visit.status === "Pending"
      ).length;

      const doctorVisitCompletedCount = filteredVisits.filter(
          (visit) => visit.visitDoctor && visit.status === "Success"
      ).length;
      const chemistVisitCompletedCount = filteredVisits.filter(
          (visit) => visit.visitChemist && visit.status === "Success"
      ).length;
      const pendingTasks = totalTasks - (doctorVisitCompletedCount + chemistVisitCompletedCount);

      // Donut chart data
      const chartData = {
          labels: [
              "Doctor Visits Completed",
              "Chemist Visits Completed",
              "Pending Tasks",
              "Doctor Visit Frequency",
              "Chemist Visit Frequency",
          ],
          datasets: [
              {
                  data: [
                      doctorVisitCompletedCount,
                      chemistVisitCompletedCount,
                      pendingTasks,
                      doctorFrequency,
                      chemistFrequency,
                  ],
              },
          ],
      };

      // Visit details for the table
      const visitDetails = filteredVisits.map((visit) => ({
          visitDate: visit.visitDate,
          name: visit.visitDoctor
              ? visit.visitDoctor.name
              : visit.visitChemist
              ? visit.visitChemist.name
              : "Unknown",
          userId: visit.visitDoctor
              ? visit.visitDoctor.userId
              : visit.visitChemist
              ? visit.visitChemist.userId
              : "Unknown",
          roles: visit.visitDoctor
              ? visit.visitDoctor.roles
              : visit.visitChemist
              ? visit.visitChemist.roles
              : "Unknown",
          frequency: visit.visitDoctor
              ? visit.visitDoctor.visitFrequency.toString()
              : visit.visitChemist
              ? visit.visitChemist.visitFrequency.toString()
              : 0, // Default as a string
          matchedFrequency: visit.status === "Success" ? 1 : 0, // Convert to string
          percentage: visit.status === "Success" ? "100%" : "0%",
      }));

      // console.log("Visit Details:", visitDetails);

      // Doctor and chemist data
      const doctors = filteredVisits
          .filter((visit) => visit.visitDoctor)
          .map((visit) => ({
              id: visit.visitDoctor._id,
              name: visit.visitDoctor.name,
              userId: visit.visitDoctor.userId,
          }));

      const chemists = filteredVisits
          .filter((visit) => visit.visitChemist)
          .map((visit) => ({
              id: visit.visitChemist._id,
              name: visit.visitChemist.name,
              userId: visit.visitChemist.userId,
          }));

      // console.log("Doctors:", doctors);
      // console.log("Chemists:", chemists);

      // Response summary
      res.status(200).json({
          message: "Employee coverage fetched successfully.",
          summary: {
              coverage: {
                  totalTasks,
                  doctorVisitScheduleCount,
                  doctorVisitCompletedCount,
                  chemistVisitScheduleCount,
                  chemistVisitCompletedCount,
                  doctorFrequency,
                  chemistFrequency,
              },
              chartData,
              visits: visitDetails, // Include visit details for the table
              doctors: [...new Map(doctors.map((d) => [d.id, d])).values()],
              chemists: [...new Map(chemists.map((c) => [c.id, c])).values()],
          },
      });
  } catch (error) {
      console.error("Error fetching employee coverage:", error.message);
      res.status(500).json({ error: "Internal server error while fetching employee coverage." });
  }
};





  
 
module.exports = {getAdminDashboard , getEmployeeCoverage , exportFile ,importFromExcel}