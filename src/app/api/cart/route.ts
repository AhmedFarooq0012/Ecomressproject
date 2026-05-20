import { addToCart, getCart } from "@/libs/controllers/cartController";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return getCart(req);
}

export async function POST(req: NextRequest) {
  return addToCart(req);
}
