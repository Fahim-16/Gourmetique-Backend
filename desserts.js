const mongoose = require("mongoose");

const  DessertSchema = new mongoose.Schema({
    hotelid:{type:String},
    dsi:{type:Number},
    ditem:{type:String},
    dprice:{type:Number}

});

const desserts = mongoose.model("Dessert", DessertSchema);
module.exports = {desserts}