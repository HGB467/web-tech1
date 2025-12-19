const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
let router = express.Router();

const parseRoles = (roles = "") =>
  roles
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

router.get("/", async (req, res) => {
  const users = await User.find().sort({ name: 1 });
  res.render("super-admin/users/list", { pageTitle: "Users", users });
});

router.get("/create", async (req, res) => {
  res.render("super-admin/users/create", { pageTitle: "Invite User" });
});

router.post("/create", async (req, res) => {
  const { name, email, password, roles } = req.body;
  if (!name || !email || !password)
    return res.status(400).send("Missing fields");
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(400).send("Email already exists");
  const hash = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email: email.toLowerCase(),
    password: hash,
    roles: parseRoles(roles),
  });
  res.redirect("/super-admin/users");
});

router.get("/edit/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send("User not found");
  res.render("super-admin/users/edit", {
    pageTitle: "Edit User",
    user,
  });
});

router.post("/edit/:id", async (req, res) => {
  const { name, email, password, roles } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send("User not found");
  user.name = name || user.name;
  user.email = email ? email.toLowerCase() : user.email;
  user.roles = parseRoles(roles);
  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }
  await user.save();
  res.redirect("/super-admin/users");
});

router.get("/delete/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect("/super-admin/users");
});

module.exports = router;
