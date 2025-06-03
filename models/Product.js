const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  product_id: { type: String, required: true, unique: true },
  product_code: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  product_name: String,
  product_description: String,
  product_url: String,
  redirect_uri: { type: String, required: true },

  permissions: [
    {
      pid: String,
      pname: String
    }
  ],

  secret: String,

  // Plan details as array for multiple plans
  plans: [
    {
      name: { type: String, enum: ['Freemium', 'Pro', 'Business'], required: true },
      basePrice: { type: Number, default: 199 },
      includedQuota: {
        whatsapp: { type: Number, default: 500 },
        email: { type: Number, default: 1000 }
      },
      overageCharges: {
        whatsapp: { type: Number, default: 0.20 },
        email: { type: Number, default: 0.10 }
      },
      minRecharge: { type: Number, default: 100 },
      autoRenewal: { type: Boolean, default: true },
      features: [String],
      purchaseDate: { type: Date, default: Date.now },
      expiryDate: { 
        type: Date, 
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    }
  ]
});

module.exports = mongoose.model('Product', clientSchema);
