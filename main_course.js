const mongoose = require("mongoose");

const  MenuSchema = new mongoose.Schema({
    hotelid:{type:String},
    msi:{type:Number},
    mitem:{type:String},
    mprice:{type:Number}

});

const main_course = mongoose.model("MainCourse", MenuSchema);
module.exports = {main_course}