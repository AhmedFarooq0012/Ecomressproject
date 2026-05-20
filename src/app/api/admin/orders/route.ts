import { getAllOrders } from "@/libs/controllers/orderController";
import { NextRequest } from "next/server";

// Admin: Fetch every order in the database across all customer profiles
export async function GET(req: NextRequest) {
  return getAllOrders(req);
}
