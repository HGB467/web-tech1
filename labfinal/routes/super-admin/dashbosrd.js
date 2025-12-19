const express = require("express");
const Product = require("../../models/Product");
const User = require("../../models/User");
let router = express.Router();
router.get("/", async (req, res) => {
  const [products, users] = await Promise.all([
    Product.find().sort({ _id: -1 }).limit(5),
    User.find().sort({ _id: -1 }).limit(5),
  ]);
  const [productCount, userCount] = await Promise.all([
    Product.countDocuments(),
    User.countDocuments(),
  ]);
  return res.render("super-admin/dashboard", {
    pageTitle: "Overview",
    stats: { productCount, userCount },
    products,
    users,
  });
});
module.exports = router;
