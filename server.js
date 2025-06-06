const express = require('express');
const dotenv = require('dotenv');

const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require("path");
const frontendRoutes = require('./routes/frontendRoutes');

// Load environment variables
dotenv.config();

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
    const allowed = ['http://localhost:3000','http://localhost:3001', 'https://gws365.in', 'https://admin.gws365.in', 'https://auth.gws365.in', 'https://pay.gws365.in'];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Routes
app.use('/', frontendRoutes);
app.use('/', require('./routes/role'));
app.use('/', require('./routes/user'));
app.use('/api/v1.0/roles-and-permission', require('./routes/Rolesandpermissionapi'));
app.use('/api/v1.0/users', require('./routes/userapi'));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
