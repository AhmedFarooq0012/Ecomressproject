import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true },
    priceAtPurchase: { type: Number, required: true }, // Keeps historical price data accurate
  },
  { timestamps: true },
);

const OrderItem =
  mongoose.models.OrderItem || mongoose.model("OrderItem", orderItemSchema);
export default OrderItem;
