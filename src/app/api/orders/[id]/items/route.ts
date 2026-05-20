import { getOrderItemsByOrderId } from "@/libs/controllers/orderItemController";
import { NextRequest } from "next/server";

// Public Customer / Admin: View full detail array profile items listed in an invoice reference
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolvedParams = await params;
  // resolvedParams.id represents your unique orderId value from path segment parameter matching arrays
  return getOrderItemsByOrderId(req, resolvedParams.id);
}
