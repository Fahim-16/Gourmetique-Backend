const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  type: { type: String, enum: ["veg", "non-veg", "both"], required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  photo: { type: String }, // Store image path
});

const restaurantregModel = mongoose.model("Restaurant", RestaurantSchema);

module.exports = {restaurantregModel };
