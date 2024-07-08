// IMOORTING PACKAGES 
const express = require("express");
const app = express();
const cors = require("cors");

// DOTENV FILE IMPORTED
const dotenv = require("dotenv");
dotenv.config({path:"./config.env"})
const PORT = process.env.PORT;

// CONNECTING DATABASE & MIDDLEWARES
app.use(cors());    
require("./db/connection");
app.use(express.json());                // USED TO CONVERT DATA IN JSON

// SERVER TESTING AND INITIALIZING
app.use(require("./routes/auth"));
app.get("/",(req,res)=>{ res.send("Hy")})
app.listen(PORT,()=>{console.log(`Server Started at Port No. ${PORT}`)})