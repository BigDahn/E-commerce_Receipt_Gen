const express = require("express");
const { signUp, Login, protect } = require("../controller/authController");

const orderRouter = require("./orderRouter");

const router = express.Router();

router.post("/signUp", signUp);
router.post("/login", Login);

router.use(protect);
router.use("/:userId/orders", orderRouter);
module.exports = router;
