const express = require('express');
const dotenv = require('dotenv');

const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require("path");
const frontendRoutes = require('./routes/frontendRoutes');
const connectDB = require('./config/db.js');
connectDB();
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
    // Allow localhost for development
    const localhost = 'http://localhost:3005';

    // Allow all *.gws365.in subdomains
    const gwsDomainPattern = /^https:\/\/([a-z0-9-]+\.)*gws365\.in$/;

    if (!origin || origin === localhost || gwsDomainPattern.test(origin)) {
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
app.use('/api/v1.0/roles-and-permission', require('./routes/apirolesandpermission'));
app.use('/api/v1.0/users', require('./routes/apiuser'));
app.use('/api/projects', require('./routes/api/projects'));
app.use('/api', require('./controllers/whatsapp_web'));
app.use('/api/contact', require('./routes/api/contact'));
app.use('/api', require('./routes/api/message'));
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
