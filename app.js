const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { restaurantregModel } = require("./restaurantregModel");
const customerModel = require("./customerModel");
const ReviewModel = require("./cureviewModel");
const { starter } = require("./starter");
const { main_course } = require("./main_course");
const { desserts } = require("./desserts");
const { orderModel } = require("./orderModel");
const { rushModel } = require("./rushModel");
const { AcceptedOrder } = require("./AcceptedOrder");
const AdsModel = require("./resads");


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const SECRET_KEY = "restlogin";
const SECRET_KEYCustomer = "cuslogin";

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("uploads folder created.");
}

app.use("/uploads", express.static("uploads"));

// MongoDB Connection
mongoose.connect(
  "mongodb+srv://fahim:Abcd1234@cluster0.ygq5j.mongodb.net/Gourmetique?retryWrites=true&w=majority&appName=Cluster0"
);
//Don't mess with it

// Multer Setup for Image Uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save images in 'uploads/' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    return cb(null, true);
  } else {
    return cb(
      new Error("Only images (JPG, PNG, GIF, WEBP) are allowed!"),
      false
    );
  }
};

const upload = multer({ storage, fileFilter });

// Restaurant Registration Route
app.post("/restaurantregistration", upload.single("photo"), async (req, res) => {
  try {
    const { restaurantName, ownerName, email, phone, address, type, username, password } = req.body;
    if (!req.file) return res.status(400).json({ error: "Please upload an image!" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newRestaurant = new restaurantregModel({
      restaurantName,
      ownerName,
      email,
      phone,
      address,
      type,
      username,
      password: hashedPassword,
      photo: req.file.path,
    });
    await newRestaurant.save();
    res.status(201).json({ message: "Restaurant registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/cusreview", upload.single("image"), async (req, res) => {
  try {
    const { title, hotelName } = req.body;
    if (!req.file) return res.status(400).json({ error: "Please upload an image!" });

    const newReview = new ReviewModel({
      image: req.file.path, // ✅ Save image path
      title,
      hotelName
    });

    await newReview.save();
    res.status(201).json({ message: "posted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.post("/resads", upload.single("image"), async (req, res) => {
  try {
    const { title, description, hotelId } = req.body;
    if (!req.file) return res.status(400).json({ error: "Please upload an image!" });

    const newAds = new AdsModel({
      image: req.file.path, // ✅ Save image path
      title,
      description,
      hotelId
    });

    await newAds.save();
    res.status(201).json({ message: "posted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/cusreg", async (req, res) => {
  try {
    const { name, mobileno, email, address, gender, username, password } = req.body;

    // Check if required fields are present
    if (!name || !mobileno || !email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if mobileno is null or empty
    if (!mobileno.trim()) {
      return res.status(400).json({ message: "Mobile number cannot be empty" });
    }

    // Check if the mobile number already exists
    const existingCustomer = await customerModel.findOne({ mobileno });
    if (existingCustomer) {
      return res.status(400).json({ message: "Mobile number already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new customer
    const newCustomer = new customerModel({
      name,
      mobileno,
      email,
      address,
      gender,
      username,
      password: hashedPassword,
    });

    await newCustomer.save();
    res.status(201).json({ message: "Customer registered successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});



app.post("/cuslogin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const customer = await customerModel.findOne({ username });

    if (!customer) return res.status(400).json({ error: "User not found!" });

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials!" });

    const token = jwt.sign({ id: customer._id }, SECRET_KEY, { expiresIn: "1d" });

    // Send token along with customer details
    res.status(200).json({
      message: "Login successful",
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        mobileno: customer.mobileno,
        email: customer.email,
        address: customer.address,
        gender: customer.gender,
        username: customer.username
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/add-starter', async (req, res) => {
  try {
    const { hotelid, si, item, price } = req.body;

    // Basic validation
    if (!hotelid || !si || !item || !price) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newStarter = new starter({ hotelid, si, item, price });
    await newStarter.save();

    res.status(201).json({ message: 'Starter added successfully', data: newStarter });
  } catch (error) {
    console.error('Error adding starter:', error);
    res.status(500).json({ message: 'Server error' });
  }
});




app.post('/add-mains', async (req, res) => {
  try {
    const { hotelid, msi, mitem, mprice } = req.body;

    // Basic validation
    if (!hotelid || !msi || !mitem || !mprice) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newMains = new main_course({ hotelid, msi, mitem, mprice });
    await newMains.save();

    res.status(201).json({ message: 'Main Course added successfully', data: newMains });
  } catch (error) {
    console.error('Error adding main course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



app.post('/add-dessert', async (req, res) => {
  try {
    const { hotelid, dsi, ditem, dprice } = req.body;

    // Basic validation
    if (!hotelid || !dsi || !ditem || !dprice) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newDessert = new desserts({ hotelid, dsi, ditem, dprice });
    await newDessert.save();

    res.status(201).json({ message: 'Dessert added successfully', data: newDessert });
  } catch (error) {
    console.error('Error adding dessert:', error);
    res.status(500).json({ message: 'Server error' });
  }
});







// Login Route
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const restaurant = await restaurantregModel.findOne({ username });

    if (!restaurant) return res.status(400).json({ error: "User not found!" });

    const isMatch = await bcrypt.compare(password, restaurant.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials!" });

    const token = jwt.sign({ id: restaurant._id }, SECRET_KEY, { expiresIn: "1d" });

    // Send token along with user details
    res.status(200).json({
      message: "Login successful",
      token,
      restaurant: {
        id: restaurant._id,
        restaurantName: restaurant.restaurantName,
        ownerName: restaurant.ownerName,
        email: restaurant.email,
        phone: restaurant.phone,
        address: restaurant.address,
        type: restaurant.type,
        username: restaurant.username,
        photo: restaurant.photo
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Middleware to protect routes
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ error: "Access denied!" });
  try {
    const verified = jwt.verify(token.split(" ")[1], SECRET_KEY);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid Token!" });
  }
};


const verifyTokencus = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(403).json({ error: "Access denied!" });

  try {
    const verified = jwt.verify(token.split(" ")[1], SECRET_KEYCustomer);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid Token!" });
  }
};


// Protected route example
app.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "Access granted!", user: req.user });
});

app.get("/customer/dashboard", verifyTokencus, (req, res) => {
  res.json({ message: "Welcome to customer dashboard!", user: req.user });
});


// View All Registered Restaurants
app.get("/viewrestaurant", async (req, res) => {
  try {
    const restaurants = await restaurantregModel.find();
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View All Starters
app.post("/viewstarters", async (req, res) => {
  try {
    const hotelid = req.body.hotelid;
    const starters = await starter.find({
      hotelid: hotelid
    });
    res.json(starters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// View All Main Course
app.post("/viewmains", async (req, res) => {
  try {
    const hotelid = req.body.hotelid;
    const mains = await main_course.find({
      hotelid: hotelid
    });
    res.json(mains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// View All Desserts
app.post("/viewdesserts", async (req, res) => {
  try {
    const hotelid = req.body.hotelid;
    const desserts1 = await desserts.find({
      hotelid: hotelid
    });
    res.json(desserts1);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// View a Specific Restaurant by ID (POST request)
app.post("/viewsprestaurant", async (req, res) => {
  try {
    const restaurantId = req.body._id;
    const restaurant = await restaurantregModel.findById(restaurantId).select('restaurantName address phone');

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




app.get("/viewcus", async (req, res) => {
  try {
    const customer = await customerModel.find();
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.get("/viewreview", async (req, res) => {
  try {
    const reviews = await ReviewModel.find();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});






app.post("/viewads", async (req, res) => {
  try {
    const { hotelId } = req.body;

    let filter = {};
    if (hotelId) {
      filter = { hotelId }; // Filter by hotelId
    }

    const viewads = await AdsModel.find(filter);
    res.json(viewads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





app.get("/viewadmincusads", async (req, res) => {
  try {
    const viewads = await AdsModel.find(); // Fetch all ads

    const adsWithRestaurantNames = await Promise.all(viewads.map(async (adDoc) => {
      const hotelId = new mongoose.Types.ObjectId(adDoc.hotelId);
      const hotel = await restaurantregModel.findById(hotelId);

      // Convert Mongoose document to plain JS object
      const ad = adDoc.toObject();

      // Append restaurantName
      ad.restaurantName = hotel ? hotel.restaurantName : null;

      return ad;
    }));

    res.json(adsWithRestaurantNames);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});











app.post("/delres", async (req, res) => {
  try {
    const id = req.body._id;
    console.log(id);

    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    const result = await restaurantregModel.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(200).json({ message: "Deleted successfully", deleted: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/delcus", async (req, res) => {
  try {
    const id = req.body._id;
    console.log(id);

    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    const result = await customerModel.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({ message: "Deleted successfully", deleted: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




//Place Order
app.post('/placeorder', async (req, res) => {
  const { hotelId, items, numberOfCustomers, timeSlot, grandTotal, customerId, paymentId, orderDate } = req.body;

  const newOrder = new orderModel({
    hotelId,
    items,
    numberOfCustomers,
    timeSlot,
    grandTotal,  // Use the grand total from the request
    customerId,  // Use the customerId from the request
    paymentId,
    orderDate,
  });

  const newOrderSummary = new rushModel({
    hotelId,
    numberOfCustomers,
    timeSlot,
    orderDate,
  });

  try {
    // Save the order to the database
    const savedOrder = await newOrder.save();

    // Save the summary order to the other table
    const savedOrderSummary = await newOrderSummary.save();

    // Respond with the saved order
    res.status(200).json({
      message: 'Order placed successfully!',
      order: savedOrder,
      orderSummary: savedOrderSummary,
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Failed to place order. Please try again.' });
  }
});



app.post('/vieworders', async (req, res) => {
  const { hotelId } = req.body;

  try {
    // Step 1: Fetch all orders for the given hotelId
    const orders = await orderModel.find({ hotelId });

    // Step 2: Get all accepted orders for the hotel
    const acceptedOrders = await AcceptedOrder.find({ hotelId });

    const acceptedOrderIds = acceptedOrders.map(order => order.orderId.toString());

    // Step 3: Filter out accepted orders
    const newOrders = orders.filter(order => !acceptedOrderIds.includes(order._id.toString()));

    // Step 4: Populate customer name using customerId
    const ordersWithCustomerName = await Promise.all(
      newOrders.map(async (order) => {
        const customer = await customerModel.findById(order.customerId).select('name'); // or 'customerName'
        return {
          ...order._doc,
          customerName: customer ? customer.name : 'Unknown Customer'
        };
      })
    );

    res.status(200).json({ message: 'Orders fetched successfully!', orders: ordersWithCustomerName });

  } catch (error) {
    console.error('Error fetching new orders:', error);
    res.status(500).send({ message: 'Error fetching new orders.', error });
  }
});






// API to save accepted order
app.post('/saveAcceptedOrder', async (req, res) => {
  const { orderId, customerName, orderDate, grandTotal, items, hotelId, timeSlot } = req.body;

  try {
    // Convert "DD/MM/YYYY" string to Date object
    const parsedDate = new Date(orderDate.split('/').reverse().join('-'));

    // Ensure all items have correct structure: { name, count }
    const sanitizedItems = (items || []).map(item => ({
      name: item.name,
      count: Number(item.count), // Ensure count is a number
    }));

    const newOrder = new AcceptedOrder({
      orderId,
      customerName,
      orderDate: parsedDate,
      grandTotal: Number(grandTotal),
      items: sanitizedItems,
      hotelId,
      timeSlot
    });

    await newOrder.save();
    res.status(200).send({ message: 'Order accepted and saved!' });
  } catch (error) {
    console.error('Error saving accepted order:', error);
    res.status(500).send({ message: 'Error saving accepted order.', error });
  }
});



// API to get accepted orders
app.post('/getAcceptedOrders', async (req, res) => {
  const { hotelId } = req.body;

  try {
    const acceptedOrders = await AcceptedOrder.find({ hotelId });
    res.status(200).json(acceptedOrders);
  } catch (error) {
    res.status(500).send({ message: 'Error retrieving accepted orders.', error });
  }
});


// API to get orders in user profile
app.post('/getUserOrders', async (req, res) => {
  const { customerId } = req.body;

  try {
    const orders = await orderModel.find({ customerId: customerId });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).send({ message: 'Error retrieving orders.', error });
  }
});




// Update Menu Item API (POST Request)
app.post('/updateMenuItem', async (req, res) => {
  const { itemId, category, name, price } = req.body;

  // Depending on the category, choose the appropriate collection to update
  let collection;
  let updateFields;

  switch (category) {
    case 'starters':
      collection = starter;
      updateFields = { item: name, price: price };
      break;
    case 'mainCourse':
      collection = main_course;
      updateFields = { mitem: name, mprice: price }; // Adjusted field names
      break;
    case 'desserts':
      collection = desserts;
      updateFields = { ditem: name, dprice: price }; // Adjusted field names
      break;
    default:
      return res.status(400).send("Invalid category.");
  }

  try {
    const updatedItem = await collection.findByIdAndUpdate(
      itemId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).send("Item not found.");
    }

    res.status(200).send(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).send("Internal server error.");
  }
});



app.post('/deleteMenuItem', async (req, res) => {
  const { itemId, category } = req.body;

  // Depending on the category, choose the appropriate collection to delete from
  let collection;

  switch (category) {
    case 'starters':
      collection = starter;
      break;
    case 'mainCourse':
      collection = main_course;
      break;
    case 'desserts':
      collection = desserts;
      break;
    default:
      return res.status(400).send("Invalid category.");
  }

  try {
    const deletedItem = await collection.findByIdAndDelete(itemId);

    if (!deletedItem) {
      return res.status(404).send("Item not found.");
    }

    res.status(200).send({ message: `Deleted item: ${deletedItem.item || deletedItem.mitem || deletedItem.ditem}` });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).send("Internal server error.");
  }
});









// Start Server
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
