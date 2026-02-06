const express = require("express");
const { protect, rbac } = require("../controller/authController");
const {
  addProduct,
  editProduct,
  ownersMiddleware,
  deleteProduct,
  getProduct,
  getAllProduct,
} = require("../controller/productController");

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route("/addProduct").post(rbac("owner"), ownersMiddleware, addProduct);

router.route("/getAllProduct").get(getAllProduct);

router
  .route("/:productId")
  .get(getProduct)
  .patch(rbac("owner"), ownersMiddleware, editProduct)
  .delete(rbac("owner"), ownersMiddleware, deleteProduct);
module.exports = router;
