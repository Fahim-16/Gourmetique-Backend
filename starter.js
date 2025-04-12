const mongoose = require("mongoose");

const  StarterSchema = new mongoose.Schema({
    hotelid:{type:String},
    si:{type:Number},
    item:{type:String},
    price:{type:Number}

});

const starter = mongoose.model("Starter", StarterSchema);
module.exports = {starter}