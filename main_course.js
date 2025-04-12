const mongoose = require("mongoose");

const  MenuSchema = new mongoose.Schema({
    si:{type:Number},
    item:{type:String},
    price:{type:Number},

});

const Menu = mongoose.model("Starter", MenuSchema);
module.exports = Menu;