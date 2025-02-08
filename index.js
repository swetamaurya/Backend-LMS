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
const exportRouter = require("./routes/exportRoute");
const studentRouter = require("./routes/studentRoute");
const batchCategoryRouter = require("./routes/batchCategoryRoute");

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
app.use("/export", exportRouter);
app.use("/student", studentRouter);

// Test route
app.get("/test", async (req, res) => {
  return res.status(200).send("Welcome to NIA 🙋‍♂️");
});

// ----------- Agora Token Endpoints -----------

// 1. RTC Token Generation (for audio/video channels)
app.post("/rtc-token", (req, res) => {
  const { channelName, uid, role } = req.body;
  if (!channelName || !uid || !role) {
    return res.status(400).json({ error: "Invalid request parameters" });
  }

  const expirationTimeInSeconds = 3600; // 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiration = currentTimestamp + expirationTimeInSeconds;

  // Choose role based on the request (e.g. "publisher" for teacher)
  const rtcRole = role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    rtcRole,
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

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
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
