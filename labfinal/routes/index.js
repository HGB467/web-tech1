var express = require("express");
var router = express.Router();
var Product = require("../models/Product");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
/* GET home page. */
router.get("/login", function (req, res, next) {
  return res.render("site/login");
});
router.post("/login", async function (req, res, next) {
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash("danger", "User with this email not present");
    return res.redirect("/login");
  }
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (validPassword) {
    req.session.user = user;
    req.flash("success", "Logged in Successfully");
    return res.redirect("/");
  } else {
    req.flash("danger", "Invalid Password");
    return res.redirect("/login");
  }
});
router.get("/register", function (req, res, next) {
  return res.render("site/register");
});
router.get("/logout", async (req, res) => {
  req.session.user = null;
  console.log("session clear");
  return res.redirect("/login");
});
router.post("/register", async function (req, res, next) {
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    req.flash("danger", "User with given email already registered");
    return res.redirect("/register");
  }
  user = new User(req.body);
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);

  await user.save();
  return res.redirect("/login");
});
router.get("/contact-us", function (req, res, next) {
  return res.render("site/contact", { layout: "layout" });
});

router.post("/contact-us", async function (req, res, next) {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    req.flash("danger", "Please fill all fields.");
    return res.redirect("/contact-us");
  }
  req.flash("success", "Thanks for reaching out. We will get back shortly.");
  return res.redirect("/contact-us");
});

module.exports = router;
