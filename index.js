/*************  index.js  *************/
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connection = require("./config/database");

// Agora token package
const {
  RtcTokenBuilder,
  RtcRole,
  RtmTokenBuilder,
  RtmRole,
} = require("agora-access-token");

// Import your routes
const roleRouter = require("./routes/roleRoute");
const userRouter = require("./routes/userRoute");
const adminRouter = require("./routes/adminRoute");
const deleteRouter = require("./routes/deleteRoute");
const courseRouter = require("./routes/courseRoute");
const courseCategoryRouter = require("./routes/courseCategoryRoute");
const batchRouter = require("./routes/batchRoute");
const studentRouter = require("./routes/studentRoute");
const batchCategoryRouter = require("./routes/batchCategoryRoute");
const classRouter = require("./routes/classRoute");
const importRouter = require("./routes/importRoute");
const exportRouter = require("./routes/exportRoute");
const searchRouter = require("./routes/searchRoute");
const resourcesRouter = require('./routes/resourcesRoute')

dotenv.config();

// -- Replace with your Agora App ID and Certificate (or use env variables) --
const APP_ID = "3a55484f226043e18c5298242837f753";
const APP_CERTIFICATE = "5feb08b694354bef9d95f5e9391df942";

const PORT = process.env.PORT || 6000;

const app = express();
app.use(express.json());
app.use(cors());

// ----------- Your existing routes -----------
app.use("/role", roleRouter);
app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/delete", deleteRouter);
app.use("/course", courseRouter);
app.use("/courseCategory", courseCategoryRouter);
app.use("/batch", batchRouter);
app.use("/batchCategory", batchCategoryRouter);
app.use("/student", studentRouter);
app.use("/class",classRouter)
app.use('/import',importRouter)
app.use("/export", exportRouter);
app.use("/search", searchRouter);
app.use("/resource", resourcesRouter);

 




// Test route
app.get("/test", async (req, res) => {
  return res.status(200).send("Welcome to NIA 🙋‍♂️");
});

// ----------- Agora Token Endpoints -----------
// ----------- Agora Token Endpoints -----------
// ----------------- New GET Token Endpoint -----------------
// Usage: GET /rtcToken?channel=CHANNEL_NAME&uid=USER_ID
app.get("/rtcToken", (req, res) => {
  const channelName = req.query.channel;
  if (!channelName) {
    return res.status(400).json({ error: "channel is required" });
  }
  
  let uid = req.query.uid;
  if (!uid || uid === "") {
    uid = 0;
  } else {
    uid = Number(uid);
  }
  
  const expirationTimeInSeconds = 3600; // 1 hour validity
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiration = currentTimestamp + expirationTimeInSeconds;
  
  // Use the Agora Access Token package (you already have it)
  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,              // from your env or constant
    APP_CERTIFICATE,     // from your env or constant
    channelName,
    uid,
    (req.body.role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER) || RtcRole.PUBLISHER,
    privilegeExpiration
  );
  return res.json({ token });
});
// 2. RTM Token Generation (for chat / real-time messaging)
app.post("/rtm-token", (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ error: "Invalid request parameters" });
  }

  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiration = currentTimestamp + expirationTimeInSeconds;

  const token = RtmTokenBuilder.buildToken(
    APP_ID,
    APP_CERTIFICATE,
    uid,
    RtmRole.Rtm_User,
    privilegeExpiration
  );

  return res.json({ token });
});

// ----------- Socket.io Setup (optional if you need real-time signaling) -----------
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // or specify your frontend origin
  },
});


// ----------- Start the Server -----------
//------------ Lucky code -----------------
io.on("connection", (socket) => {
  socket.on("user-message", (name, role, message) => {
    io.emit("message", name, role, message);
  });
});


// ----------- Start the Server -----------
server.listen(PORT, async () => {
  try {
    await connection;
    console.log("MongoDB is connected.");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
  console.log(`Server is running on PORT : ${PORT}`);
});
