import { NextResponse, NextRequest } from "next/server";
import { comparePassword, hashPassword } from "@/libs/auth";
import db_Config from "../Db_Conifg";
import User from "../models/usermodel";
import jwt from "jsonwebtoken";

export const registerUser = async (req: NextRequest) => {
  try {
    // 1. Database connect karna
    await db_Config();

    // 2. Request body se data nikalna
    const { username, email, password } = await req.json();

    // 3. Validation (Basic)
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "Username, email and password are required" },
        { status: 400 },
      );
    }

    // 4. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 },
      );
    }

    // 5. Password hash karna (Aapki auth utility use karte hue)
    const hashedPassword = await hashPassword(password);

    // 6. Naya User create karna
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: "Customer",
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User registered successfully", success: true, user: newUser },

      { status: 201 },
    );
  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};

// login

export const login = async (req: NextRequest) => {
  try {
    await db_Config();
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "Email does not exist" },
        { status: 401 },
      );
    }
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "1d" },
    );
    return NextResponse.json({
      message: "Login Successful",
      token: token,
      success: true,
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        profilepic: user.profilepic,
      },
    });
  } catch (error) {
    console.error("login error:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error: Login Failed",
      },
      {
        status: 500,
      },
    );
  }
};
