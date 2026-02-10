const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("@exortek/express-mongo-sanitize");
const userRouter = require("./routes/userRouter");
const businessRouter = require("./routes/businessRouter");
const productRouter = require("./routes/productRouter");
const rateLimiter = require("express-rate-limit");

const globalErrorHandler = require("./controller/errorController");
const ErrorClass = require("./utils/ErrorClass");

const app = express();

if (process.env.NODE_ENV === "Development") {
  app.use(morgan("dev"));
}

app.use(cors());
app.use(helmet());
app.use(mongoSanitize());
app.use(express.json({ limit: "10kb" }));

const limiter = rateLimiter({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api", limiter);

app.use("/api/v1/users", userRouter);
app.use("/api/v1/business", businessRouter);
app.use("/api/v1/product", productRouter);

app.use((req, res, next) => {
  next(
    new ErrorClass(`Can't find route ${req.originalUrl} on this server!!!`, 404)
  );
});

app.use(globalErrorHandler);

module.exports = app;
