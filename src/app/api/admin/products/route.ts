import { createProduct, getProducts } from "@/libs/controllers/productcontroller";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  return createProduct(req);
}
export async function GET(req: NextRequest) {
  return getProducts(req);
}

