import db_Config from "@/libs/Db_Conifg";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "../models/usermodel";
import Product from "../models/productmodel";
import CartItem from "../models/cartItemmodel";


const SECRET_KEY = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET!;

// Helper function to extract user identity safely from token
const authenticateUser = async (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];
  if (!token) return null;

  try {
    const decoded: any = jwt.verify(token, SECRET_KEY);
    await db_Config();
    return await User.findOne({ email: decoded.email });
  } catch (err) {
    return null;
  }
};

// ========================================================
// 1. ADD TO CART / UPDATE QUANTITY (Protected: Customer Only)
// ========================================================
export const addToCart = async (req: NextRequest) => {
  try {
    const dbUser = await authenticateUser(req);
    if (!dbUser) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 },
      );
    }

    const { productId, quantity } = await req.json();
    const qty = quantity !== undefined ? Number(quantity) : 1;

    if (!productId || qty <= 0) {
      return NextResponse.json(
        {
          message: "Valid Product ID and quantity greater than 0 are required",
        },
        { status: 400 },
      );
    }

    await db_Config();

    // Verify if product actually exists in database
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Upsert operation: your unique index ensures we can safely use findOneAndUpdate
    // If the item exists, it increments the quantity. If not, it creates a new row.
    const cartItem = await CartItem.findOneAndUpdate(
      { userId: dbUser._id, productId },
      { $inc: { quantity: qty } }, // Automatically increments existing quantity
      { new: true, upsert: true, setDefaultsOnInsert: true }, // Creates row if it doesn't exist
    );

    return NextResponse.json(
      {
        message: "Item added/updated in cart successfully",
        success: true,
        cartItem,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to process cart operation", details: error.message },
      { status: 500 },
    );
  }
};

// ========================================================
// 2. GET CURRENT USER'S CART (Protected: Customer Only)
// ========================================================
export const getCart = async (req: NextRequest) => {
  try {
    const dbUser = await authenticateUser(req);
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db_Config();

    // Fetch all items and populate item info (name, price, image)
    const cartItems = await CartItem.find({ userId: dbUser._id })
      .populate({
        path: "productId",
        select: "name price image stock category",
        strictPopulate: false,
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, count: cartItems.length, cartItems },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch cart elements" },
      { status: 500 },
    );
  }
};

// ========================================================
// 3. REMOVE SINGLE ITEM FROM CART (Protected: Customer Only)
// ========================================================
export const removeFromCart = async (req: NextRequest, id: string) => {
  try {
    const dbUser = await authenticateUser(req);
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db_Config();

    // Delete item by its CartItem row ID ensuring it belongs to the logged-in user
    const deletedItem = await CartItem.findOneAndDelete({
      _id: id,
      userId: dbUser._id,
    });

    if (!deletedItem) {
      return NextResponse.json(
        { error: "Cart item not found or unauthorized access" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Item removed from cart successfully", success: true },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to remove item" },
      { status: 500 },
    );
  }
};
