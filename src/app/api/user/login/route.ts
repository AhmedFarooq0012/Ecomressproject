import { login } from "@/libs/controllers/userController";
import db_Config from "@/libs/Db_Conifg";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  return login(req);
}
