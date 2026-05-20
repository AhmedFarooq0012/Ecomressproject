import { updateOrderStatus } from "@/libs/controllers/orderController";
import { NextRequest } from "next/server";

// Admin: Modify item fulfillment sequence parameter values
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolvedParams = await params;
  return updateOrderStatus(req, resolvedParams.id);
}
