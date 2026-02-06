const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      index: true,
      unique: true,
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

    // shippingAddress: {
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
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: [
        "credit_card",
        "debit_card",
        "paypal",
        "stripe",
        "bank_transfer",
        "cash_on_delivery",
      ],
      required: true,
    },
    emailStatus: {
      type: String,
      default: "queued",
      enum: ["queued", "sent", "rejected"],
    },

    receiptGenerated: {
      type: Boolean,
      default: false,
      index: true,
    },
    receiptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Receipt",
    },
    receiptEmailSent: {
      type: Boolean,
      default: false,
    },
    orderDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    cloudUrl: {
      type: String,
    },

    cloudPublicId: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderSchema.pre("save", async function (next) {
  if (!this.isNew || this.orderNumber) return next();
  this.orderNumber = await generateOrderNumber(this.businessId);

  next();
});

async function generateOrderNumber(businessId) {
  const timestamp = Date.now();
  const businessCode = businessId.toString().slice(-4).toUpperCase();
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  const orderNumber = `ORD-${businessCode}-${timestamp}-${randomNum}`;

  return orderNumber;
}

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
