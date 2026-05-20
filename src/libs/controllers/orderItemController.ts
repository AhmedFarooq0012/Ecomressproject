import db_Config from "@/libs/Db_Conifg";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "../models/usermodel";
import OrderItem from "../models/orderItemmodel";
import Product from "../models/productmodel";
// Ensure this matches your exact product model path

const SECRET_KEY = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET!;

// Helper: Token validation security helper logic
const authenticateUser = async (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");

  // ✅ FIX HERE: Grab index [1] to safely assign a plain string
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
// 1. GET ALL ITEMS FOR A SPECIFIC ORDER (Protected: Anyone logged in)
// ========================================================
export const getOrderItemsByOrderId = async (
  req: NextRequest,
  orderId: string,
) => {
  try {
    const dbUser = await authenticateUser(req);
    if (!dbUser) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing token" },
        { status: 401 },
      );
    }

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID parameter is required" },
        { status: 400 },
      );
    }

    await db_Config();

    // Fetch all items belonging to the target order ID
    // Populating product details (name, image, price) to show them nicely on frontend checkout receipt
    const items = await OrderItem.find({ orderId })
      .populate({
        path: "productId",
        select: "name image price category description",
        strictPopulate: false,
      })
      .sort({ createdAt: 1 });

    return NextResponse.json(
      { success: true, count: items.length, items },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Get Order Items Error:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve order items summary documents",
        details: error.message,
      },
      { status: 500 },
    );
  }
};

// ========================================================
// 2. BULK CREATE ORDER ITEMS (Internal Utility Function)
// ========================================================
// This is called internally during your createOrder process to handle cart array inputs.
export const bulkCreateOrderItems = async (
  orderId: string,
  items: Array<{ productId: string; quantity: number }>,
) => {
  try {
    await db_Config();

    const preparedItems = [];

    // Loop through array to fetch product and lock historic pricing details
    for (const item of items) {
      const productObj = await Product.findById(item.productId);
      if (!productObj) {
        throw new Error(
          `Product reference ${item.productId} not found in store database records.`,
        );
      }

      // Format schema matching data payload properties
      preparedItems.push({
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: productObj.price, // Lock historical price securely!
      });
    }

    // Insert all documents at once using Mongoose insertMany (highly optimized fast operation)
    return await OrderItem.insertMany(preparedItems);
  } catch (error: any) {
    console.error("Bulk Create Order Items Internals Crashed:", error);
    throw error;
  }
};
