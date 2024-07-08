const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    expendat: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    catagory: {
        type: String,
        required: true
    },
    datetime: {
        type: String,
        required: true
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
   
});




const Expense = mongoose.model("EXPENSES", taskSchema);
module.exports = Expense;