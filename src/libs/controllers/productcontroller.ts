import db_Config from "@/libs/Db_Conifg";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "../models/usermodel";
import Product from "../models/productmodel";

// Use the exact same secret key used during the login generation
const SECRET_KEY = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET!;

interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

// Allowed categories list based on your requirements
const ALLOWED_CATEGORIES = [
  "bag",
  "pen",
  "watch",
  "furniture",
  "electronics",
  "clothing",
];

// ==========================================
// 1. CREATE PRODUCT (Protected: Admin Only)
// ==========================================
export const createProduct = async (req: NextRequest) => {
  try {
    // A. Extract and Verify Authorization Header Token
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: No token provided" },
        { status: 401 },
      );
    }

    let currentUserEmail: string | null = null;
    try {
      const decoded: any = jwt.verify(token, SECRET_KEY);
      currentUserEmail = decoded.email;
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    if (!currentUserEmail) {
      return NextResponse.json(
        { error: "User identity not found in token" },
        { status: 401 },
      );
    }

    // B. Connect Database
    await db_Config();

    // C. Strict Database Admin Role Verification
    const dbUser = await User.findOne({ email: currentUserEmail });
    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 },
      );
    }

    if (dbUser.role !== "Admin") {
      return NextResponse.json(
        { error: "Forbidden: Only Admins can create products" },
        { status: 403 },
      );
    }

    // D. Extract all 7 Fields from Request Body
    const { name, description, stock, totalItem, category, image, price } =
      await req.json();

    // E. Validation for All Required Fields
    if (
      !name ||
      !description ||
      category === undefined ||
      !image ||
      price === undefined
    ) {
      return NextResponse.json(
        {
          message:
            "Name, description, category, image, and price are strictly required fields",
        },
        { status: 400 },
      );
    }

    // F. Validate Category Type (Enforces specific category strings lowercased)
    const normalizedCategory = category.toLowerCase().trim();
    if (!ALLOWED_CATEGORIES.includes(normalizedCategory)) {
      return NextResponse.json(
        {
          message: `Invalid category. Allowed values are: ${ALLOWED_CATEGORIES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // G. Create Product Matching Your 7 Schema Properties Exactly
    // Note: Since .create() saves automatically, you do not need a separate .save() call
    const newProduct = await Product.create({
      name,
      description,
      stock: stock !== undefined ? stock : 0,
      totalItem: totalItem !== undefined ? totalItem : 0,
      category: normalizedCategory,
      image,
      price,
    });

    return NextResponse.json(
      {
        message: "Product created successfully",
        success: true,
        product: newProduct,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product", details: error.message },
      { status: 500 },
    );
  }
};

// ==========================================
// 2. GET ALL PRODUCTS (Public / All Users)
// ==========================================
export const getProducts = async (req: NextRequest) => {
  try {
    await db_Config();

    const products = await Product.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, count: products.length, products },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Get Products Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
};

///
// ==========================================
// 3. UPDATE PRODUCT (Protected: Admin Only)
// ==========================================
export const updateProduct = async (req: NextRequest, id: string) => {
  try {
    // A. Token validation check
    const authHeader = req.headers.get("authorization");
    
    // FIX HERE: Added index [1] to extract string, not string[]
    const token = authHeader?.split(" ")[1]; 

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    let currentUserEmail: string | null = null;
    try {
      // Now token is safely processed as a plain string
      const decoded: any = jwt.verify(token, SECRET_KEY);
      currentUserEmail = decoded.email;
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // B. Connection and Role Check
    await db_Config();
    const dbUser = await User.findOne({ email: currentUserEmail });
    if (!dbUser || dbUser.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden: Only Admins can modify products" }, { status: 403 });
    }

    // C. Get Update Payload Fields
    const body = await req.json();

    // D. Normalizing category if provided in the update body
    if (body.category) {
      body.category = body.category.toLowerCase().trim();
      if (!ALLOWED_CATEGORIES.includes(body.category)) {
        return NextResponse.json(
          { message: `Invalid category. Allowed values are: ${ALLOWED_CATEGORIES.join(", ")}` },
          { status: 400 }
        );
      }
    }

    // E. Find Product and Apply Changes
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product item not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Product updated successfully", success: true, product: updatedProduct },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Update Product Error:", error);
    return NextResponse.json({ error: "Failed to update target product document", details: error.message }, { status: 500 });
  }
};

// ==========================================
// 4. DELETE PRODUCT (Protected: Admin Only)
// ==========================================
export const deleteProduct = async (req: NextRequest, id: string) => {
  try {
    // A. Token validation check
    const authHeader = req.headers.get("authorization");
    
    // FIX HERE: Added index [1] to extract string, not string[]
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    let currentUserEmail: string | null = null;
    try {
      // Now token is safely processed as a plain string
      const decoded: any = jwt.verify(token, SECRET_KEY);
      currentUserEmail = decoded.email;
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // B. Connection and Role Check
    await db_Config();
    const dbUser = await User.findOne({ email: currentUserEmail });
    if (!dbUser || dbUser.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden: Only Admins can remove products" }, { status: 403 });
    }

    // C. Execute Document Removal Action
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ error: "Product item not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Product deleted safely from records", success: true },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Delete Product Error:", error);
    return NextResponse.json({ error: "Failed to delete target product document", details: error.message }, { status: 500 });
  }
};
