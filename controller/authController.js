const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const ErrorClass = require("../utils/ErrorClass");
const sendToken = require("../utils/sendToken");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

exports.rbac = (...role) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (!role.includes(userRole))
      return next(
        new ErrorClass("You are not permitted to perform this operation", 404)
      );

    next();
  };
};

exports.Login = catchAsync(async (req, res, next) => {
  if (!req.body.email || !req.body.password)
    return next(
      new ErrorClass("Please Provide the necessary credentials", 404)
    );

  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );

  if (!(await user.ComparePassword(req.body.password, user.password)) || !user)
    return next(new ErrorClass("Incorrect Password or email", 404));

  sendToken(res, 200, user);
});

exports.signUp = catchAsync(async (req, res, next) => {
  if (!req.body)
    return next(
      new ErrorClass("Please Provide the necessary information", 404)
    );

  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  sendToken(res, 200, user);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization?.startsWith("Bearer")
  ) {
    token = req.headers.authorization?.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(
      new ErrorClass("You are not logged in .. Please login and try again", 401)
    );

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.data._id);

  // console.log(user);

  if (!user)
    return next(
      new ErrorClass("The user belonging to this token no longer exists.", 401)
    );

  if (user.changedPasswordAfter(decoded.iat))
    return next(
      new ErrorClass(
        "User recently changed password. Please log in again.",
        401
      )
    );

  req.user = user;

  next();
});
