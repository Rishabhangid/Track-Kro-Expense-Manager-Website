// SCHEMA FOR USER INFORMATION USED IN LOGIN, SIGNUP
const mongoose = require("mongoose");
// TO encrypt Password
const bcrypt = require("bcryptjs");
const jsonweb = require("jsonwebtoken");

// UserSchema for User Information
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
});

// Pre Fuction to encrypt Password which runs before saving data in DB
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) { // it mean jb pass chnge ho tb hi ecrypt krna he.
        this.password = await bcrypt.hash(this.password, 12);

    }
    next();

})

// Password Hashing FUnction
userSchema.methods.generateAuthToken = async function () {
    try {
        let token = jsonweb.sign({ _id: this._id }, process.env.SECRETKEY);
        // ( database tokens = db tokens({ db token:let token }) )
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;

    }
    catch (err) { console.log(err); }
}

// Exporting Schema
const User = mongoose.model("USERS", userSchema);
module.exports = User;