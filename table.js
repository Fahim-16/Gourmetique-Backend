const mongoose = require("mongoose");

const  TableSchema = new mongoose.Schema({
    noofcustomer:{type:Number},
    timeslot:{type:TimeRanges}
});

const Noofcustomers = mongoose.model("Starter", TableSchema);
module.exports = Noofcustomers;