import { NextRequest } from "next/server";
import { deleteAddress } from "@/libs/controllers/addressController";

// Customer: Remove an individual address card by its table row ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolvedParams = await params;
  return deleteAddress(req, resolvedParams.id);
}
