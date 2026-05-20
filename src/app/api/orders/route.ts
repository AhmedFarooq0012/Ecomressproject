import { createOrder, getMyOrders } from "@/libs/controllers/orderController";
import { NextRequest } from "next/server";

// Customer: Get personal purchase log history

// Customer: Dispatch/Place a new order request
export async function POST(req: NextRequest) {
  return createOrder(req);
}
//

export async function GET(req: NextRequest) {
  return getMyOrders(req);
}
