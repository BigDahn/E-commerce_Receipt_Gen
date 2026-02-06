const Business = require("../models/businessModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const ErrorClass = require("../utils/ErrorClass");

exports.ownersMiddleware = (req, res, next) => {
  const { businessId } = req.params;

  if (!req.user.business.includes(businessId) && req.user.role !== "owner") {
    return next(
      new ErrorClass("You are not permitted to perform this operation", 401)
    );
  }

  next();
};

exports.addProduct = catchAsync(async (req, res, next) => {
  const { businessId } = req.params;

  const business = await Business.findById(businessId);

  if (!business)
    return next(
      new ErrorClass(
        "You are not permitted to add a product without a business",
        401
      )
    );

  const product = await Product.create({
    name: req.body.name,
    price: req.body.price,
    business: businessId,
    quantity: req.body.quantity,
  });

  res.status(201).json({
    status: "success",
    data: {
      product,
    },
  });
});

exports.editProduct = catchAsync(async (req, res, next) => {
  const { productId, businessId } = req.params;

  const product = await Product.findOne({
    $and: [{ _id: productId }, { business: businessId }],
  });

  if (!product) return next(new ErrorClass("Not Found. Try again", 404));

  Object.keys(req.body).map((data) => (product[data] = req.body[data]));

  await product.save();

  res.status(200).json({
    status: "Success",
    data: {
      product,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  await Product.findByIdAndUpdate(productId, {
    isActive: false,
  });

  res.status(200).json({
    status: "Success",
    data: null,
  });
});

exports.getAllProduct = catchAsync(async (req, res, next) => {
  const { businessId } = req.params;

  const product = await Product.find({
    business: businessId,
  });

  if (!product)
    return next(new ErrorClass("No product found try again later", 404));

  res.status(200).json({
    status: "Success",
    data: {
      product,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);

  if (!product)
    return next(new ErrorClass("No product found try again later", 404));

  res.status(200).json({
    status: "Success",
    data: {
      product,
    },
  });
});
