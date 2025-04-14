const mongoose = require("mongoose");


const orderSchema = new mongoose.Schema({
    hotelId: { type: String },
    items: [
        {
            id: { type: String },
            name: { type: String },
            category: { type: String },
            price: { type: Number },
            count: { type: Number },
        },
    ],
    numberOfCustomers: { type: Number },
    timeSlot: { type: String },
    grandTotal: { type: Number },
    customerId: { type: String },
    paymentId: { type: String },
    orderDate: { type: Date, default: Date.now },
});

const orderModel = mongoose.model("Orders", orderSchema);
module.exports = { orderModel };