const mongoose = require("mongoose");


const rushSchema = new mongoose.Schema({
    hotelId: { type: String },
    numberOfCustomers: { type: Number },
    timeSlot: { type: String },
});

const rushModel = mongoose.model("BusyTime", rushSchema);
module.exports = { rushModel };