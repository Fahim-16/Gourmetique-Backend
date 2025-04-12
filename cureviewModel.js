const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
    image:{type:String},
    title:{type:String},
    hotelName:{type:String}
});

const ReviewModel = mongoose.model("CusReview", ReviewSchema);
module.exports = ReviewModel;