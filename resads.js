const mongoose = require('mongoose');

const AdsSchema = new mongoose.Schema({
    image: { type: String },
    title: { type: String },
    description: { type: String },
    hotelId: { type: String }
});

const AdsModel = mongoose.model("ResAds", AdsSchema);
module.exports = AdsModel;