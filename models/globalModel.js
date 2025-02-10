const Admin = require("../models/adminModel");
const {Role} = require("../models/roleModel");
const Batch = require("../models/batchModel");
const Class = require("../models/classModel");
const Course = require("../models/courseModel");
const User = require("../models/userModel");

const models = {
    admin: Admin,
    user: User,
    role: Role,
    batch: Batch,
    class: Class,
    course: Course,
  };
  
   
  // Population configuration for all models
const populationConfig = {
  task: [
    { path: 'assignedTo' },
    { path: 'project' },
    { path: 'assignedBy' },
  ],
  officetask : [
 
    { path: 'assignedTo' },
    { path: 'project' },
    { path: 'assignedBy' },
  ],
  lead:[
    { path: 'assignedTo' },
    { path: 'createdBy' },


  ],
  project: [
    { path: 'clientName', select: 'name userId' },
    { path: 'assignedTo' , select: 'name userId'},
    { path: 'tasks' },
  ],
  user: [
    { path: 'assigned' },
    { path: 'clientName' },
    { path: 'leave' },
    { path: 'attendance' },
    { path: 'Manager' },
    { path: 'Supervisor' },
    { path: 'departments' },
    { path: 'designations' },
  ],
  expense: [
    { path: 'purchaseBy' },
  ],
  leaves: [
    { path: 'leaveType' },
    { path: 'employee' },
    { path: 'approvedBy' },
  ],
  invoice: [
    { path: 'client' },
    { path: 'project' },
  ],
  estimates: [
    { path: 'client' },
    { path: 'project' },
  ],
  resignation: [
    { path: 'employee' },
  ],
  termination: [
    { path: 'employee' },
  ],
  policy: [
    { path: 'department' },
  ],
  product: [
    { path: 'category' },
    { path: 'vendor' },

  ],
  attendance: [
    { path: 'employee', select: 'name email' },
    { path: 'approvedBy', select: 'name email' },
  ],
  contractor :[
    { path: 'tasks'},
    { path: 'projectName'},

  ],
  vendor :[
 
      { path: 'projectName'}

 
  ],
  enquiry :[
  {
      path: 'lead', // Populate lead data only if it exists
      model: 'Lead',
      select: 'leadName leadId email phone createdBy',

  },{
      path: 'createdBy', // Populate offers data
      select: 'name email userId',
  },{
      path: 'offers', // Populate offers data
      options: { sort: { _id: -1 } },
      select: 'offerReferenceNumber offerDate price policy offerTitle',
  } 
   ],
  offer :[
 
      { path: 'enquiry'},
      {path: 'lead', // Populate lead data only if it exists
      model: 'Lead',
      select: 'leadName leadId email phone createdBy',
}

  ],
sale :[{ path: 'invoice'}],
saleInvoice :[{ path: 'sale'},{ path: 'material'}],
purchase :[{ path: 'invoice'}],
purchaseInvoice :[{ path: 'purchase'},{ path: 'material'}]

};

// Function to get population rules dynamically
const getModelByName = (modelName) => {
  if (!modelName || typeof modelName !== "string") {
      console.error("Invalid model name provided:", modelName);
      return null;
  }

  const lowerCaseModelName = modelName.toLowerCase();
  const model = models[lowerCaseModelName] || null;
  if (!model) {
      console.error("Model not found for type:", modelName);
  }
  return model;
};
const getPopulationRules = (modelName) => populationConfig[modelName.toLowerCase()] || [];

  // Export both models and the function
  module.exports = {
    getPopulationRules,
    getModelByName
  };
  