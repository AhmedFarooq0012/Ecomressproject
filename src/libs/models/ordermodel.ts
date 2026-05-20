import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      // FIX HERE: Agar validation missing ho toh strict population dynamic parameter cross-compile bypass karwayega
      ref: "Address",
      required: true,
    },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
