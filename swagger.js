// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WhatsApp API Docs',
      version: '1.0.0',
      description: 'API Documentation for WhatsApp Integration',
    },
    servers: [
      {
        url: 'http://localhost:3005',
        description: 'Local server',
      },
    ],
  },
  apis: ['./routes/api/*.js'], // adjust path to your API routes
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
