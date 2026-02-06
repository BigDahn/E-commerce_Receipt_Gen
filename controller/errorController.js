const ErrorClass = require("../utils/ErrorClass");

const handleDuplicateFieldDB = (error) => {
  const value = error.keyValue.email;

  const message = `Duplicate Field value: ${value}. Please use another value`;

  return new ErrorClass(message, 404);
};

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;

  return new ErrorClass(message, 404);
};

const handleValidationErrorDB = (err) => {
  const error = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input Data:${error.join(", ")}`;

  return new ErrorClass(message, 400);
};

const handleJWTError = () =>
  new ErrorClass("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new ErrorClass("Your token has expired! Please log in again.", 401);

const sendErrorDev = (err, req, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: "Error",
      message: err.message,
    });
  }

  return res.status(err.statusCode).json({
    status: "Error",
    message: "Something went wrong .. Please try again later",
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "Development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = Object.create(err);
    error.message = err.message;

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
