var express = require("express");
var router = express.Router();
var Product = require("../models/Product");
var Order = require("../models/Order");

const buildCartCookie = (cart) => ({
  maxAge: 1000 * 60 * 60 * 24 * 7,
  httpOnly: false,
  sameSite: "lax",
});

const parseCart = (cartCookie) =>
  Array.isArray(cartCookie) ? [...cartCookie] : [];

const getCartDetails = async (cartIds) => {
  const counts = cartIds.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});
  const ids = Object.keys(counts);
  let products = [];
  if (ids.length) {
    products = await Product.find({ _id: { $in: ids } });
  }
  const items = products.map((p) => {
    const quantity = counts[p.id] || 1;
    const price = Number(p.price || 0);
    const lineTotal = price * quantity;
    return { product: p, quantity, lineTotal, price };
  });
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
  return { items, total };
};

router.get("/cart", async function (req, res, next) {
  const cart = parseCart(req.cookies.cart);
  const { items, total } = await getCartDetails(cart);
  res.render("site/cart", { items, total });
});

router.get("/cart/remove/:id", function (req, res, next) {
  const cart = parseCart(req.cookies.cart).filter(
    (itemId) => itemId !== req.params.id
  );
  res.cookie("cart", cart, buildCartCookie(cart));
  req.flash("success", "Updated cart");
  res.redirect("/cart");
});

router.get("/cart/clear", function (req, res, next) {
  res.cookie("cart", [], buildCartCookie([]));
  req.flash("success", "Cart cleared");
  res.redirect("/cart");
});

router.get("/add-cart/:id", function (req, res, next) {
  const cart = parseCart(req.cookies.cart);
  cart.push(req.params.id);
  res.cookie("cart", cart, buildCartCookie(cart));
  req.flash("success", "Product added to cart");
  res.redirect("back");
});

router.get("/checkout", async function (req, res, next) {
  const cart = parseCart(req.cookies.cart);
  const { items, total } = await getCartDetails(cart);
  if (!items.length) {
    req.flash("danger", "Add items to your cart first");
    return res.redirect("/cart");
  }
  res.render("site/checkout", { items, total });
});

router.post("/checkout", async function (req, res, next) {
  const { name, email, address } = req.body;
  if (!name || !email) {
    req.flash("danger", "Name and email are required");
    return res.redirect("/checkout");
  }
  const cart = parseCart(req.cookies.cart);
  const { items, total } = await getCartDetails(cart);
  if (!items.length) {
    req.flash("danger", "Add items to your cart first");
    return res.redirect("/cart");
  }
  const order = new Order({
    customerName: name,
    customerEmail: email,
    address,
    items: items.map((item) => ({
      productId: item.product._id,
      name: item.product.name,
      price: item.price,
      quantity: item.quantity,
      image: item.product.image,
    })),
    total,
    status: "ordered",
  });
  await order.save();
  res.cookie("cart", [], buildCartCookie([]));
  req.flash("success", "Order placed");
  res.redirect(`/order/${order._id}`);
});

router.get("/order/:id", async function (req, res, next) {
  const order = await Order.findById(req.params.id);
  if (!order) return next();
  const steps = ["ordered", "shipped", "delivered"];
  res.render("site/order-status", { order, steps });
});

router.get("/product/:id", async function (req, res, next) {
  const product = await Product.findById(req.params.id);
  if (!product) return next();
  res.render("site/product", { product });
});

router.get("/:page?", async function (req, res, next) {
  const page = Number(req.params.page) || 1;
  const pageSize = 10;
  const totalProducts = await Product.countDocuments();
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const products = await Product.find()
    .skip((safePage - 1) * pageSize)
    .limit(pageSize);
  return res.render("site/homepage", {
    pagetitle: "Featured Products",
    products,
    page: safePage,
    totalPages,
  });
});

module.exports = router;
