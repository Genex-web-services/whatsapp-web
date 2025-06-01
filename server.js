const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require("path");
const connectDB = require('./config/db');
const clientRoutes = require('./routes/clientRoutes');
const frontendRoutes = require('./routes/frontendRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to make env variables available in all EJS views
app.use((req, res, next) => {
  res.locals.env = process.env;
  next();
});

// Set EJS view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS: allow only localhost and genexwebservices.com (with subdomains support)
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      /\.genexwebservices\.com$/ // regex for subdomains like auth.genexwebservices.com
    ];

    if (!origin) return callback(null, true); // allow REST tools or curl

    const isAllowed = allowedOrigins.some((entry) =>
      typeof entry === 'string' ? origin === entry : entry.test(origin)
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Routes
app.use('/', frontendRoutes);
app.use('/api/v1.0/client', clientRoutes);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
