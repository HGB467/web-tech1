const express = require("express");
const Order = require("../../models/Order");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ _id: -1 });
    res.render("super-admin/orders/list", {
      orders,
      pageTitle: "Orders",
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/edit/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send("Order not found");

    res.render("super-admin/orders/edit", {
      order,
      pageTitle: "Update Order",
    });
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/edit/:id", async (req, res) => {
  try {
    const status = req.body.status;
    const allowed = ["ordered", "shipped", "delivered"];
    if (!allowed.includes(status)) {
      return res.status(400).send("Invalid status");
    }
    await Order.findByIdAndUpdate(req.params.id, { status });
    res.redirect("/super-admin/orders");
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).send("Failed to update order");
  }
});

router.get("/delete/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.redirect("/super-admin/orders");
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).send("Failed to delete order");
  }
});

module.exports = router;
