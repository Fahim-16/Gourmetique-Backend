const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobileno: { type: String, required: true, unique: true }, // Ensure it's required and unique
    email: { type: String, required: true, unique: true },
    address: { type: String },
    gender: { type: String },
    username: { type: String, required: true },
    password: { type: String, required: true }
});

const customerModel = mongoose.model("Customerreg", customerSchema);
module.exports = customerModel;
