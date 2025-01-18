const express = require("express");
const app = express()
const dotenv = require("dotenv");
const cors = require("cors");
const connection = require("./config/database");
const roleRoute = require("./routes/roleRoute");
const userRoute = require("./routes/userRoute");
 const adminRouter = require("./routes/adminRoute");
const deleteRouter = require("./routes/deleteRoute");
 
dotenv.config()
PORT = process.env.PORT || 6000

 
app.use(express.json());
app.use(cors())

 
 
app.use("/role", roleRoute)
app.use("/admin",adminRouter)
app.use("/user", userRoute)
 app.use("/delete",deleteRouter)


app.get("/test", async (req,res)=>{
    return res.status(200).send("Welcome to NIA 🙋‍♂️")
})

 
app.listen(PORT , async (req,res)=>{
    try {
        await connection
        console.log("MongoDB is connected.")
    } catch (error) {
        console.log(error)
    }
    console.log(`Server is running on PORT : ${PORT}`)
})


