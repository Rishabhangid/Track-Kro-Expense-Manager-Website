// SCHEMA FOR USER INFORMATION USED IN LOGIN, SIGNUP
const mongoose = require("mongoose");


// UserSchema for User Information
const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    messages:[
        {
            message:{
                type: String,
                required: true
            }
        }
    ]
});


// Exporting Schema
const Contact = mongoose.model("USERMESSAGES", contactSchema);
module.exports = Contact;