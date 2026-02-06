const express = require("express");
const { rbac, protect } = require("../controller/authController");
const {
  createBusiness,
  editBusiness,
  deleteBusiness,
  getAllBusiness,
} = require("../controller/businessController");
const { getBusiness } = require("../controller/businessController");

const orderRouter = require("./orderRouter");

const productRouter = require("./productRouter");
const { ownersMiddleware } = require("../controller/productController");

const router = express.Router({ mergeParams: true });

router.use(protect);

router.use("/:businessId/product", productRouter);

router.use("/:businessId", orderRouter);

router.get("/getAllBusiness", rbac("owner"), ownersMiddleware, getAllBusiness);

router.route("/create-business").post(rbac("owner"), createBusiness);
router
  .route("/:businessId")
  .get(getBusiness)
  .patch(rbac("owner"), ownersMiddleware, editBusiness)
  .delete(rbac("owner"), ownersMiddleware, deleteBusiness);

module.exports = router;
