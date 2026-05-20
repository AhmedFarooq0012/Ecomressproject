import {
  deleteProduct,
  updateProduct,
} from "@/libs/controllers/productcontroller";
import { NextRequest, NextResponse } from "next/server";

// Update individual item specifications
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolvedParams = await params;
  return updateProduct(req, resolvedParams.id);
}

// Erase target element identity entirely
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolvedParams = await params;
  return deleteProduct(req, resolvedParams.id);
}
