const mongoose = require("mongoose");


const rushSchema = new mongoose.Schema({
    hotelId: { type: String },
    numberOfCustomers: { type: Number },
    timeSlot: { type: String },
    orderDate: { type: Date, default: Date.now },
});

const rushModel = mongoose.model("BusyTime", rushSchema);
module.exports = { rushModel };