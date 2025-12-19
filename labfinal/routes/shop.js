var express = require("express");
var router = express.Router();
var Product = require("../models/Product");
var Order = require("../models/Order");
var cartMiddleware = require("../middlewares/cartnotEmpty");

const buildCartCookie = (cart) => ({
  maxAge: 1000 * 60 * 60 * 24 * 7,
  httpOnly: false
});

//Normalizes cookie to an array so we only get an array to deal with
const parseCart = (cartCookie) =>
  Array.isArray(cartCookie) ? [...cartCookie] : [];

// Gets ids stored in req.cookies.cart, creates an objects which maps multiple ids to quantity and then fetches the products
// for those ids to be sent and displayed to client side 
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


// Gets cart details and renders ejs cart view with those details
router.get("/cart", async function (req, res) {
  const cart = parseCart(req.cookies.cart);
  const { items, total } = await getCartDetails(cart);
  res.render("site/cart", { items, total });
});

//Removes an item from cart based on item id (removes all ids for that item in the array), resets the cookie
// and then redirects to cart page
router.get("/cart/remove/:id", function (req, res) {
  const cart = parseCart(req.cookies.cart).filter(
    (itemId) => itemId !== req.params.id
  );
  res.cookie("cart", cart, buildCartCookie(cart));
  req.flash("success", "Updated cart");
  res.redirect("/cart");
});

//Deletes the cart, resets empty array in cookie, shows success message using flash function and redirects to cart page again
router.get("/cart/clear", function (req, res) {
  res.cookie("cart", [], buildCartCookie([]));
  req.flash("success", "Cart cleared");
  res.redirect("/cart");
});

//Adds an item in the cart, sets the cookie again and redirects to same page again
router.get("/add-cart/:id", function (req, res) {
  const cart = parseCart(req.cookies.cart);
  cart.push(req.params.id);
  res.cookie("cart", cart, buildCartCookie(cart));
  req.flash("success", "Product added to cart");
  res.redirect("back");
});

//Gets cart details to show on the checkout page and renders the checkout view
router.get("/checkout", cartMiddleware, async function (req, res) {
  const cart = parseCart(req.cookies.cart);
  const { items, total } = await getCartDetails(cart);
  if (!items.length) {
    req.flash("danger", "Add items to your cart first");
    return res.redirect("/cart");
  }
  res.render("site/checkout", { items, total });
});

//This route creates an order, gets details like name, email and address from the form, gets cart items from the cart
// and  creates an order in mongodb, clears cart cookie and redirects to the order status page
router.post("/checkout", cartMiddleware, async function (req, res) {
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


//Renders the order status page for a given order id, passes order details to relevant ejs template
router.get("/order/:id", async function (req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).send("Order not found");
  const steps = ["ordered", "shipped", "delivered"];
  res.render("site/order-status", { order, steps });
});

//Renders the product details page, gets product details from database and passes to product ejs template to be rendered
router.get("/product/:id", async function (req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).send("Product not found")
  res.render("site/product", { product });
});

//Main dashboard renderer route, fetches total pages, gets the current page data (1 if not specified), fetches products for that page
//and renders the homepage route
router.get("/:page?", async function (req, res) {
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
