const mongoose = require("mongoose");

const  StarterSchema = new mongoose.Schema({
    si:{type:Number},
    item:{type:String},
    price:{type:Number},

});

const Starter = mongoose.model("Starter", StarterSchema);
module.exports = Starter;