const User = require("../modals/userSchema");
const Expense = require("../modals/taskSchema");
const Contact = require("../modals/contactSchema");
// To Encrypt Password
const bcrypt = require("bcryptjs");
const jsonweb = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const mongoose = require("mongoose");


// Register Route Code
exports.registerUser = async (req, res) => {
    const { name, email, number, password } = req.body;
    if (!name || !email || !number || !password) {
        console.log("Empty Feilds");
        return res.status(422).json({ error: "Empty Feilds." });
    }
    try {
        const finduser = await User.findOne({ email: email });
        if (finduser) {
            console.log("User with this email already exists");
            return res.status(500).json({ message: "User already with this email address." })
        }
        else {
            const user = new User({ name: name, email: email, number: number, password: password });
            const saveuser = await user.save();
            if (saveuser) {
                console.log("User registered succesfully.");
                return res.status(200).json({ message: "User registered succesfully." });
            }
            else {
                console.log("User Cant registered.");
                return res.status(400).json({ error: "User Cant registered." });
            }
        }
    }
    catch (error) {
        console.log(error);
        res.status(422).json({ error: "catch error register route." })
    }
}

// Login Route Code
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        console.log("Empty Data Fields, Please fill the data properly.");
        return res.status(400).json({ error: "Empty Data Fields, Please fill the data properly." });
    }
    try {
        const finduser = await User.findOne({ email: email });
        if (!finduser) {
            console.log("User not found.");
            return res.status(422).json({ error: "User not found." });
        }
        console.log("User found.");

        // Compare the provided password with the hashed password from the database
        const isPasswordValid = await bcrypt.compare(password, finduser.password);

        if (isPasswordValid) {
            const token = await finduser.generateAuthToken();
            // console.log(token);
            // sending cookie
            res.cookie("jwtoken", token, {
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: "/",
                sameSite: "strict",
            });
            console.log("Login successful.");
            return res.status(200).json({ message: "Login successful." });
        } else {
            console.log("Wrong Password.");
            return res.status(401).json({ error: "Wrong Password." });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Server error" });
    }
};

// Forgot Password Code
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        console.log("Empty Feild");
        res.status(400).json({ error: "Empty Feild" });
    }
    try {
        const findemail = await User.findOne({ email: email });
        if (!findemail) {
            console.log("Email not found.");
            res.status(422).json({ error: "Email not found." });
        }
        else {
            // console.log('Email:', process.env.EMAIL);
            // console.log('Password:', process.env.PASSWORD);

            const token = jsonweb.sign({ id: findemail._id }, process.env.KEY, { expiresIn: "5m" }); // Generating Temporaly Token to verify Reset Password User,expires in 5m. 
            console.log(token);

            // Code to send Reset Link to User Email
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                port: 465,
                secure: true,
                logger: true,
                debug: true,
                secureConnection: false,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                },
                tls: {
                    rejectUnauthorized: true
                }
            });

            var mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: 'Reset Password Link',
                // text: `http://localhost:3000/reset/${token}`  // forntend component link to open the rest page.
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <p style="color: #333;">Hello,</p>
                <p style="color: #555; font-size: 16px;">To reset your password, please click the following link:</p>
                <a href="http://localhost:3000/reset/${token}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #007BFF; text-decoration: none; border-radius: 5px; margin: 10px 0;">Reset Password</a>
                <p style="color: #555; font-size: 16px;">The link is valid only for 5 minutes.</p>
                <p style="color: #555; font-size: 16px;">If you did not request a password reset, please ignore this email.</p>
                <br>
                <img src="https://drive.google.com/file/d/1TPjYT71XHStCNa1UMeRJblVOqjPK4T5G/view?usp=sharing" style="display: block; margin: 20px auto; border-radius: 10px;" alt="Example Image" />
                <p style="color: #777; font-size: 14px; text-align: center;">Best regards,<br>Your Company</p>
                </div>
                `
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    res.status(500).json({ error: "Error in sending Link." });
                } else {
                    console.log('Email sent: ' + info.response);
                    res.status(200).json({ message: "Reset Link sent to your registered email id." });
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error." });
    }
}

// Reset Pasword Code
exports.resetPasscode = async (req, res) => {
    const { token } = req.params; // getting token form fronted to verify it with DB ,wheather the token is active or expired.
    const { password } = req.body;
    try {
        const verifyy = await jsonweb.verify(token, process.env.KEY);
        const id = verifyy.id;
        const updatepassword = await bcrypt.hash(password, 12);
        const updateDB = await User.findByIdAndUpdate({ _id: id }, { password: updatepassword })
        console.log("password updated succesfully.");
        return res.status(200).json({ message: "password updated." })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "error in updating password." });
    }
}

// Storing Expense In DB
exports.storeExpense = async (req, res) => {
    const { expendat, amount, catagory, datetime } = req.body;
    const userId = req.userID;  //
    if (!expendat || !amount || !catagory || !datetime) {
        console.log("Empty data.");
        res.status(422).json({ error: "empty data." });
    }
    try {
        const newexpense = new Expense({ expendat: expendat, amount: amount, catagory: catagory, datetime: datetime, user: userId }); //
        const saveit = await newexpense.save();
        if (!saveit) {
            console.log("cant save the expense.");
            res.status(400).json({ error: "cant save the expense." });
        }
        else {
            console.log("expense saved.");
            res.status(200).json({ error: "expense saved." });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "error in catch." });
    }
}

// Sending Expense Data 
exports.sendExpense = async (req, res) => {
    try {
        const userId = req.userID; //req.user._id
        const finddata = await Expense.find({ user: userId }); //
        if (!finddata || finddata.length === 0) {
            console.log("cant finddata.")
            return res.status(422).json({ error: "cant find data." });
        }
        else {
            console.log("Data sent.")
            return res.json(finddata);
        }
    }
    catch (error) {
        console.log(error);
        console.log("error in catch");
        return res.status(400).json({ error: "error in catch" });
    }
}

// User Info Code
exports.getInfoData = async (req, res) => {
    try {
        const userId = req.userID; // Get the logged-in user's ID from the request object
        
        // Ensure userId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const finddata = await User.findById(userId); // Find the user by their ID

        if (!finddata) {
            console.log("Cannot find data.");
            return res.status(422).json({ error: "Cannot find data." });
        } else {
            console.log("Data sent.");
            return res.json(finddata);
        }
    } catch (error) {
        console.log(error);
        console.log("Error in catch");
        return res.status(400).json({ error: "Error in catch" });
    }
};

// Contact Message Code
exports.sendMessage = async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        console.log("empty feilds.");
        res.status(422).json({ error: "empty feilds" });
    }
    try {
        const contact = await Contact.findOne({ email });

        if (contact) {
            // If the contact already exists, add a new message to the messages array
            contact.messages.push({ message });
            await contact.save();
            res.status(200).json({ success: "Message added to existing contact." });
        } else {
            // If the contact doesn't exist, create a new contact with the message
            const newContact = new Contact({
                name,
                email,
                messages: [{ message }]
            });
            await newContact.save();
            res.status(201).json({ success: "New contact created with message." });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error saving message." });
    }
}

// Logout Code
exports.logOut = async (req, res) => {
    console.log("Logged Out");
    res.clearCookie("jwtoken", { path: "/" }); // the path should be same as we set at the time of defining cookie in login route.
    res.status(200).send("User Logout");
}