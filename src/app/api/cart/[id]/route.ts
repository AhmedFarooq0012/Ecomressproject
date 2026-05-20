import { removeFromCart } from "@/libs/controllers/cartController";
import { NextRequest } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolvedParams = await params;
  return removeFromCart(req, resolvedParams.id);
}
