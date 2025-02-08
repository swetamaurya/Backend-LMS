// const Class = require("../models/classModel");
// const { RtcTokenBuilder, RtcRole, RtmTokenBuilder, RtmRole } = require("agora-access-token");
// const dotenv = require("dotenv");
//  // Load environment variables
// dotenv.config();

// const APP_ID = process.env.APP_ID;
// const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

// // RTC Token Generation
// exports.RTCTokenGeneration = async (req, res) => {
//   try {
//     const { channelName, uid, role } = req.body;
//     if (!channelName || uid === undefined) {
//       return res.status(400).json({ error: 'channelName and uid are required' });
//     }

//     // Convert the string role to an Agora RTC Role
//     let rtcRole = RtcRole.SUBSCRIBER;
//     if (role === 'publisher') {
//       rtcRole = RtcRole.PUBLISHER;
//     }

//     // Token valid for 1 hour
//     const expirationTimeInSeconds = 3600;
//     const currentTimestamp = Math.floor(Date.now() / 1000);
//     const privilegeExpireTs = currentTimestamp + expirationTimeInSeconds;

//     // Generate token
//     const token = RtcTokenBuilder.buildTokenWithUid(
//       APP_ID,
//       APP_CERTIFICATE,
//       channelName,
//       Number(uid),
//       rtcRole,
//       privilegeExpireTs
//     );

//     return res.json({ token });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Failed to generate RTC token' });
//   }
// }

// // RTM Token Generation
// exports.RTMTokenGeneration = async (req, res) => {
//   try {
//     const { uid } = req.body;
//     if (!uid) {
//       return res.status(400).json({ error: 'uid is required' });
//     }

//     // RTM has only one role: Rtm_User
//     const role = RtmRole.Rtm_User;
//     const expirationTimeInSeconds = 3600;
//     const currentTimestamp = Math.floor(Date.now() / 1000);
//     const privilegeExpireTs = currentTimestamp + expirationTimeInSeconds;

//     // Generate token
//     const token = RtmTokenBuilder.buildToken(
//       APP_ID,
//       APP_CERTIFICATE,
//       uid,
//       role,
//       privilegeExpireTs
//     );

//     return res.json({ token });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Failed to generate RTM token' });
//   }
// }


// // Create a live/recorded class
// exports.createClass = async (req, res) => {
//   try {
//     const { title, type, batch, instructor, schedule, duration, autoPublish } = req.body;

//     const classData = new Class({
//       title,
//       type,
//       batch,
//       instructor,
//       materials: req.files?.materials?.map((file) => file.path) || [],
//       schedule,
//       duration,
//       autoPublish,
//     });

//     const savedClass = await classData.save();
//     res.status(201).json({ message: "Class created successfully", class: savedClass });
//   } catch (error) {
//     res.status(500).json({ message: `Error creating class: ${error.message}` });
//   }
// };

 
  
// exports.getAllClasses = async (req, res) => {
//   try {
//     const { page, limit } = req.query;
 
 
//     const query = {};
//     const skip = (parseInt(page) - 1) * parseInt(limit || 0);

//     let classes;

//     if (limit) {
//       classes = await Class.find(query)
//         .populate("batch instructor")
//         .sort({ schedule: -1 })
//         .skip(skip)
//         .limit(parseInt(limit));
//     } else {
//       classes = await Class.find(query).populate("batch instructor").sort({ schedule: -1 });
//     }

//     const totalCount = await Class.countDocuments(query);
//     const totalPages = limit ? Math.ceil(totalCount / parseInt(limit)) : 1;

//     res.status(200).json({
//       message: "Classes fetched successfully",
//       data: classes,
//       pagination: {
//         totalCount,
//         totalPages,
//         currentPage: limit ? parseInt(page) : null,
//         perPage: limit ? parseInt(limit) : totalCount,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: `Error fetching classes: ${error.message}` });
//   }
// };


 
// exports.getSingleClass = async (req, res) => {
//   try {
//     const { id } = req.params;
//      const singleClass = await Class.findById(id).populate("batch instructor");

//     if (!singleClass) {
//       return res.status(404).json({ message: "Class not found" });
//     }

//     res.status(200).json({ message: "Class fetched successfully", class: singleClass });
//   } catch (error) {
//     res.status(500).json({ message: `Error fetching class: ${error.message}` });
//   }
// };

 

// exports.updateClass = async (req, res) => {
//   try {
//     const { _id, ...updateFields } = req.body;
  
 
//     let fileUrls = [];
//     if (req.files && req.files.materials) {
//       fileUrls = req.files.materials.map((file) => file.path);
//     }

//     if (fileUrls.length > 0) {
//       updateFields.materials = fileUrls;
//     }

//     const updatedClass = await Class.findByIdAndUpdate(_id, updateFields, { new: true });

//     if (!updatedClass) {
//       return res.status(404).json({ message: "Class not found" });
//     }

//     res.status(200).json({
//       message: "Class updated successfully",
//       class: updatedClass,
//     });
//   } catch (error) {
//     res.status(500).json({ message: `Error updating class: ${error.message}` });
//   }
// };

