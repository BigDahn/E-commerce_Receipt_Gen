const Business = require("../models/businessModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const ErrorClass = require("../utils/ErrorClass");

exports.createBusiness = catchAsync(async (req, res, next) => {
  const business = await Business.create({
    name: req.body.name,
    businessEmail: req.body.businessEmail,
    phoneNumber: req.body.phoneNumber,
    owner: req.user._id,
  });

  await User.findByIdAndUpdate(req.user._id, {
    business: business.id,
  });

  res.status(201).json({
    status: "Success",
    data: {
      business,
    },
  });
});

exports.editBusiness = catchAsync(async (req, res, next) => {
  const { businessId } = req.params;

  const business = await Business.findById(businessId);

  if (!business) return next(new ErrorClass("No business found", 404));

  Object.keys(req.body).map((d) => (business[d] = req.body[d]));

  await business.save();

  res.status(200).json({
    status: "Success",
    message: "Edited Successfully",
    data: {
      business,
    },
  });
});

exports.getBusiness = catchAsync(async (req, res, next) => {
  const { businessId } = req.params;
  const business = await Business.findById(businessId);

  if (!business) return next(new ErrorClass("No business found", 404));

  res.status(200).json({
    status: "Success",
    data: {
      business,
    },
  });
});

exports.deleteBusiness = catchAsync(async (req, res, next) => {
  const { businessId } = req.params;

  await Business.findByIdAndUpdate(businessId, {
    Active: false,
  });

  res.status(200).json({
    status: "Success",
    data: null,
  });
});

exports.getAllBusiness = catchAsync(async (req, res, next) => {
  const business = await Business.find({
    owner: req.user.id,
  });

  if (!business) return next(new ErrorClass("No business found", 404));

  res.status(200).json({
    status: "Success",
    total: business.length,
    data: {
      business,
    },
  });
});
