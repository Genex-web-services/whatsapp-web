const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://gws:Tn12syN7JCpPxNKQ@gws.mnjqqxb.mongodb.net/whatsappweb?retryWrites=true&w=majority');
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
