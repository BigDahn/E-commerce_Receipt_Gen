const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION.... SHUTTING DOWN!!!!");
  console.log(err.stack);
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });
const connectDB = require("./db");
const app = require("./app");

connectDB();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNCAUGHT EXCEPTION.... SHUTTING DOWN!!!!");
  console.log(err.stack);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
