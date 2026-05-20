import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, default: 1 },
  },
  { timestamps: true },
);

// Prevents duplicate entries of the same product for a single user
cartItemSchema.index({ userId: 1, productId: 1 }, { unique: true });

const CartItem =
  mongoose.models.CartItem || mongoose.model("CartItem", cartItemSchema);
export default CartItem;
