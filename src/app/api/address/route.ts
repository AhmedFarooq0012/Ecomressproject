import { NextRequest } from "next/server";
import {
  addAddress,
  getMyAddresses,
} from "@/libs/controllers/addressController";

// Customer: Get saved shipping address history log
export async function GET(req: NextRequest) {
  return getMyAddresses(req);
}

// Customer: Save / Register a brand new location mapping row
export async function POST(req: NextRequest) {
  return addAddress(req);
}
