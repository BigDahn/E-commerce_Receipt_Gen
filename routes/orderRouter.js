const express = require("express");
const { protect, rbac } = require("../controller/authController");
const {
  Checkout,
  getOrder,
  getAllBusinessOrder,
  getABusinessOrder,
  getOrders,
} = require("../controller/orderController");
const { ownersMiddleware } = require("../controller/productController");

const router = express.Router({ mergeParams: true });

router.use(protect);

router.post("/checkout", Checkout);
router.get("/getAllOrders", getOrders);
router.get("/orders", rbac("owner"), ownersMiddleware, getAllBusinessOrder);

router.get("/:orderId", getOrder);

router.use(rbac("owner"), ownersMiddleware);

router.get("/orders/:orderId", getABusinessOrder);

module.exports = router;
