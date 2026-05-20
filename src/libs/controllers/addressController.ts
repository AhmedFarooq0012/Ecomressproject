import db_Config from "@/libs/Db_Conifg";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "../models/usermodel";
import Address from "../models/adressmodel";

const SECRET_KEY = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET!;

// Helper function to extract user identity safely from token
const authenticateUser = async (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");

  // ✅ FIX HERE: Explicit array index to capture only the string token
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
// 1. ADD NEW SHIPPING ADDRESS (Protected: Customer Only)
// ========================================================
export const addAddress = async (req: NextRequest) => {
  try {
    const dbUser = await authenticateUser(req);
    if (!dbUser) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 },
      );
    }

    const { street, city, state, postalCode, country, isDefault } =
      await req.json();

    // Basic Validation Check
    if (!street || !city || !state || !postalCode || !country) {
      return NextResponse.json(
        { message: "All structural location fields are strictly required" },
        { status: 400 },
      );
    }

    await db_Config();

    // Smart logic: Agar naya address default set ho raha hai, toh baaki purane addresses ko false kar do
    if (isDefault === true) {
      await Address.updateMany(
        { userId: dbUser._id },
        { $set: { isDefault: false } },
      );
    }

    // Check if this is the user's first address. If yes, make it default automatically!
    const addressCount = await Address.countDocuments({ userId: dbUser._id });
    const dynamicDefaultFlag = addressCount === 0 ? true : isDefault || false;

    const newAddress = await Address.create({
      userId: dbUser._id,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault: dynamicDefaultFlag,
    });

    return NextResponse.json(
      {
        message: "Shipping address saved successfully",
        success: true,
        address: newAddress,
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create address profile", details: error.message },
      { status: 500 },
    );
  }
};

// ========================================================
// 2. GET CURRENT USER'S ADDRESSES (Protected: Customer Only)
// ========================================================
export const getMyAddresses = async (req: NextRequest) => {
  try {
    const dbUser = await authenticateUser(req);
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db_Config();

    // Fetch addresses, listing the default address at the very top of the UI list
    const addresses = await Address.find({ userId: dbUser._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    return NextResponse.json(
      { success: true, count: addresses.length, addresses },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch addresses summary maps" },
      { status: 500 },
    );
  }
};

// ========================================================
// 3. DELETE SHIPPING ADDRESS (Protected: Customer Only)
// ========================================================
export const deleteAddress = async (req: NextRequest, id: string) => {
  try {
    const dbUser = await authenticateUser(req);
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db_Config();

    // Delete item row verifying ownership
    const deletedAddress = await Address.findOneAndDelete({
      _id: id,
      userId: dbUser._id,
    });

    if (!deletedAddress) {
      return NextResponse.json(
        { error: "Address instance not found or access restricted" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Address profile deleted successfully from records",
        success: true,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete address entry" },
      { status: 500 },
    );
  }
};
