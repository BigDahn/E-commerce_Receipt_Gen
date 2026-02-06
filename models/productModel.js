const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
    min: 1,
  },
  business: {
    type: mongoose.Schema.ObjectId,
    ref: "Business",
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

productSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });

  next();
});

// productSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "business",
//     select: "name",
//   });

//   next();
// });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
