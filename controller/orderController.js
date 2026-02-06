const Business = require("../models/businessModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const ErrorClass = require("../utils/ErrorClass");
const paymentQueue = require("../Queues/paymentQueue");

function handleQuantityCheck(products, data) {
  const quantityError = [];
  for (const item of data) {
    const product = products.find(
      (product) => product._id.toString() === item._id.toString()
    );
    if (product.quantity < item.quantity) {
      quantityError.push({
        productId: item._id,
        name: item.name,
        quantityOrdered: item.quantity,
        availableQuantity: product.quantity,
      });
    }
  }
  if (quantityError.length >= 1) {
    return true;
  }
}

exports.Checkout = catchAsync(async (req, res, next) => {
  const { businessId } = req.params;
  const { items, paymentMethod } = req.body;

  const business = await Business.findById(businessId);

  if (!business || !business.Active)
    return next(new ErrorClass("No business found", 404));

  const ids = items.map((item) => item._id);

  const products = await Product.find({
    _id: { $in: ids },
    business: businessId,
  });

  if (handleQuantityCheck(products, items))
    return next(
      new ErrorClass(
        "Insufficient Stock. Confirm the quantity available for each stock before proceeding",
        400
      )
    );

  const orderItems = items.map((item) => {
    const product = products.find((product) => {
      return product._id.toString() === item._id.toString();
    });

    return {
      productId: product._id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
      totalPrice: product.price * item.quantity,
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = (subtotal * 200) / 100;
  const totalAmount = subtotal + tax;

  const order = await Order.create({
    userId: req.user._id,
    customerName: req.user.name,
    customerEmail: req.user.email,
    customerPhone: "123456789",
    businessId,
    items: orderItems,
    subtotal,
    tax,
    totalAmount,
    paymentMethod,
  });

  await Product.bulkWrite(
    items.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $inc: { quantity: -item.quantity } },
      },
    }))
  );

  await paymentQueue.add("process-payment", order);

  res.status(200).json({
    status: "Success",
    message: "Order placed Successfully... Processing payment",
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const { orderId, userId } = req.params;

  const order = await Order.find({
    _id: orderId,
    userId: userId,
  });

  if (!order)
    return next(new ErrorClass("Order not found.. Please try again", 404));

  res.status(200).json({
    status: "Success",
    data: {
      order,
    },
  });
});

exports.getOrders = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  if (req.user.id !== userId)
    return next(
      new ErrorClass("You are not permitted to perform this operation", 401)
    );

  const order = await Order.find({
    userId: userId,
  });

  if (!order)
    return next(new ErrorClass("Order not found.. Please try again", 404));

  res.status(200).json({
    status: "Success",
    total: order.length,
    data: {
      order,
    },
  });
});

exports.getAllBusinessOrder = catchAsync(async (req, res, next) => {
  const { businessId } = req.params;

  const order = await Order.find({
    businessId: businessId,
  });

  if (!order)
    return next(new ErrorClass("Order not found.. Please try again", 404));

  res.status(200).json({
    status: "Success",
    total: order.length,
    data: {
      order,
    },
  });
});

exports.getABusinessOrder = catchAsync(async (req, res, next) => {
  const { businessId, orderId } = req.params;
  const order = await Order.find({
    businessId: businessId,
    _id: orderId,
  });

  if (!order)
    return next(new ErrorClass("Order not found.. Please try again", 404));

  res.status(200).json({
    status: "Success",
    data: {
      order,
    },
  });
});
