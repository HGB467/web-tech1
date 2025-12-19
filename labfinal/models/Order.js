const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    customerName: String,
    customerEmail: String,
    address: String,
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    total: Number,
    status: {
      type: String,
      enum: ["ordered", "shipped", "delivered"],
      default: "ordered",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
