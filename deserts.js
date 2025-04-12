const mongoose = require("mongoose");

const  DesertSchema = new mongoose.Schema({
    si:{type:Number},
    item:{type:String},
    price:{type:Number},

});

const Desert = mongoose.model("Starter", DesertSchema);
module.exports = Desert;