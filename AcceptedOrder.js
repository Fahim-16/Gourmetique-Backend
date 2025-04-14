const mongoose = require("mongoose");

const acceptedOrderSchema = new mongoose.Schema({
    orderId: String,
    customerName: String,
    orderDate: Date,
    grandTotal: Number,
    items: [{ name: String, count: Number }],
    hotelId: String,     // <-- Important
    timeSlot: String     // <-- Important
});


const AcceptedOrder = mongoose.model("AcceptedOrder", acceptedOrderSchema);
module.exports = { AcceptedOrder };