import { clearSession } from "@/lib/session";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await clearSession();
  return NextResponse.redirect(new URL("/login", request.url), {
    status: 303,
  });
}
