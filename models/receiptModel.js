const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const receiptSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      unique: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    businessId: {
      type: mongoose.Schema.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    // businessName: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    // businessEmail: {
    //   type: String,
    //   required: true,
    //   lowercase: true,
    //   trim: true,
    // },
    // businessPhone: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    // businessAddress: {
    //   street: {
    //     type: String,
    //     required: true,
    //   },
    //   city: {
    //     type: String,
    //     required: true,
    //   },
    //   state: {
    //     type: String,
    //     required: true,
    //   },
    //   country: {
    //     type: String,
    //     default: "USA",
    //   },
    // },
    items: [
      {
        productId: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        totalPrice: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    subtotal: {
      type: Number,
      min: 0,
      required: true,
    },
    tax: {
      type: Number,
      min: 0,
      default: 0,
      required: true,
    },
    totalAmount: {
      type: Number,
      min: 0,
      required: true,
    },
    discount: {
      type: Number,
      min: 0,
      default: 0,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: [
        "credit_card",
        "debit_card",
        "paypal",
        "stripe",
        "bank_transfer",
        "cash_on_delivery",
      ],
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

receiptSchema.pre("save", function (next) {
  if (!this.isNew || this.receiptNumber) return next();

  this.receiptNumber = `RCPT-${randomUUID()}`;

  next();
});

const receipt = mongoose.model("Receipt", receiptSchema);

module.exports = receipt;
