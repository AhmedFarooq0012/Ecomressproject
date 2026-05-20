import { updateOrderStatus } from "@/libs/controllers/orderController";
import { NextRequest } from "next/server";

// Admin: Modify order tracking status parameters via dynamic route parameter ID
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Await Next.js 15+ async router parameter context values
  const resolvedParams = await params;

  return updateOrderStatus(req, resolvedParams.id);
}
