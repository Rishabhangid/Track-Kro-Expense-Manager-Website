const express = require("express");
// For Encrypting Pasword
const bcrypt = require("bcryptjs");
const router = express.Router();
const cookieParser = require("cookie-parser");
const authee = require("../middlewares/authee"); // Authentication Code (check wheather user is login then shows home and admin page)

// Middlewares
router.use(cookieParser());

// we have defined all routes functioning in "authcontroller" and impoted here to make code redable.
const {registerUser, loginUser, forgotPassword, resetPasscode, logOut, storeExpense, sendExpense,  getInfoData, sendMessage} = require("../controllers/authcontoller");

// Route for testing porpuse.
router.get("/test",(req,res)=>{ res.send("HyTest") })

// Register Route
router.post("/register", registerUser);

// Login Route
router.post("/login", loginUser);


// Forgot Passwor Route
router.post("/forgot", forgotPassword);


// Reset Password Route
router.post("/resetpassword/:token", resetPasscode);  // passing the token to backend which we passes fron frntend.

// Logout Route
router.get("/logout", logOut);
 
// Stroing Expenses In DB Route
router.post("/store", authee, storeExpense);

// Sending Expense Data to Home Page
router.get("/getexpense", authee, sendExpense);

// Sending User Info Data
router.get("/getinfo", authee, getInfoData);

// Sending Contact Message
router.post("/sendmessage", sendMessage);

router.get("/home", authee, (req, res) => {
    console.log("wlcm to abt pge");
    res.send(req.rootUser);
});

// Exporting Routes
module.exports = router;