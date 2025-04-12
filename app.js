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
const  ReviewModel= require("./cureviewModel");


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const SECRET_KEY = "restlogin";
const SECRET_KEYCustomer ="cuslogin";

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
        const { title,hotelName } = req.body;
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

        const token = jwt.sign({ id: customer._id }, SECRET_KEY, { expiresIn: "1h" });

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
      const { si, item, price } = req.body;
  
      // Basic validation
      if (!si || !item || !price) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      const newStarter = new Starter({ si, item, price });
      await newStarter.save();
  
      res.status(201).json({ message: 'Starter added successfully', data: newStarter });
    } catch (error) {
      console.error('Error adding starter:', error);
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

        const token = jwt.sign({ id: restaurant._id }, SECRET_KEY, { expiresIn: "1h" });

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
  
app.post("/delres", async (req, res) => {
    try {
      const  id  = req.body._id;
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
      const  id  = req.body._id;
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
  
  




// Start Server
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
