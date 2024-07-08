// CONNECTING TO DATABASE
const mongoose = require("mongoose");
const DB = process.env.DATABASE;
mongoose.connect(DB)
.then(()=>{console.log("DATABASE SUCCESFULLY CONNECTED WITH BACKEND.")}) 
.catch(err =>{console.log(err)});