const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Every business must have name"],
      trim: true,
      unique: true,
    },
    businessEmail: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    tax: {
      type: Number,
      min: 0,
      default: 0,
      required: true,
    },
    discount: {
      type: Number,
      min: 0,
      default: 0,
    },

    Active: {
      type: Boolean,
      default: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

businessSchema.pre(/^find/, function (next) {
  this.find({ Active: { $ne: false } });

  next();
});

businessSchema.pre(/^find/, function (next) {
  this.populate({
    path: "owner",
    select: "-_id -__v",
  }).populate({
    path: "product",
    select: "-__v -_id",
  });

  next();
});

businessSchema.virtual("product", {
  ref: "Product",
  foreignField: "business",
  localField: "_id",
});

const Business = mongoose.model("Business", businessSchema);

module.exports = Business;
