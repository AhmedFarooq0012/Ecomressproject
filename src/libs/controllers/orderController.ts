import db_Config from "@/libs/Db_Conifg";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "../models/usermodel";
import Order from "../models/ordermodel";

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

// ==========================================
// 1. CREATE ORDER (Protected: Customer Only)
// ==========================================
export const createOrder = async (req: NextRequest) => {
  try {
    const dbUser = await authenticateUser(req);
    if (!dbUser) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 },
      );
    }

    const { addressId, totalPrice } = await req.json();

    if (!addressId || totalPrice === undefined) {
      return NextResponse.json(
        { message: "Address ID and total price are required" },
        { status: 400 },
      );
    }

    if (totalPrice < 0) {
      return NextResponse.json(
        { message: "Total price cannot be negative" },
        { status: 400 },
      );
    }

    await db_Config();

    const newOrder = await Order.create({
      userId: dbUser._id,
      addressId,
      totalPrice,
      status: "Pending",
    });

    return NextResponse.json(
      { message: "Order placed successfully", success: true, order: newOrder },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to place order", details: error.message },
      { status: 500 },
    );
  }
};

// ==========================================
// 2. GET LOGIN CUSTOMER ORDERS (Safe Fallback)
// ==========================================
export const getMyOrders = async (req: NextRequest) => {
  try {
    const dbUser = await authenticateUser(req);
    if (!dbUser) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing token" },
        { status: 401 },
      );
    }

    await db_Config();

    let orders;
    try {
      // Pehle model population ke sath try karein
      orders = await Order.find({ userId: dbUser._id })
        .populate({ path: "addressId", strictPopulate: false })
        .sort({ createdAt: -1 });
    } catch (populateError) {
      console.warn(
        "Address compilation warning. Fetching basic payload data instead.",
      );
      // Fallback: Agar Address model absent ho toh simple fields layout load hoga
      orders = await Order.find({ userId: dbUser._id }).sort({ createdAt: -1 });
    }

    return NextResponse.json(
      { success: true, count: orders.length, orders },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Get My Orders Runtime Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch your orders", details: error.message },
      { status: 500 },
    );
  }
};

// ==========================================
// 3. ADMIN: GET ALL GLOBAL CUSTOMERS ORDERS
// ==========================================
export const getAllOrders = async (req: NextRequest) => {
  try {
    const dbUser = await authenticateUser(req);
    // ST_CHECK: Only allow account identities verified with an Admin structural property
    if (!dbUser || dbUser.role !== "Admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin dashboard access required" },
        { status: 403 },
      );
    }

    await db_Config();

    // Admin pure database ke sare records check karega
    const orders = await Order.find({})
      .populate("userId", "username email")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, count: orders.length, orders },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Fetch Admin Orders Error:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve store orders dashboard records",
        details: error.message,
      },
      { status: 500 },
    );
  }
};

// ==========================================
// 4. UPDATE ORDER STATUS (Protected: Admin Only)
// ==========================================
export const updateOrderStatus = async (req: NextRequest, id: string) => {
  try {
    const dbUser = await authenticateUser(req);
    if (!dbUser || dbUser.role !== "Admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    const { status } = await req.json();

    const validStatuses = ["Pending", "In Progress", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid status value provided" },
        { status: 400 },
      );
    }

    await db_Config();

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true },
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "Target order reference not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Order status modified successfully",
        success: true,
        order: updatedOrder,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to modify progress tracking state" },
      { status: 500 },
    );
  }
};
