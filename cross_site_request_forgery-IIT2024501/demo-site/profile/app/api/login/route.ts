import { setSession } from "@/lib/session";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const USERS: Record<
  string,
  { password: string; email: string; fullName: string; role: string; memberSince: string }
> = {
  aryan: {
    password: "aryan123",
    email: "aryan@google.com",
    fullName: "Aryan Srivastava",
    role: "Administrator",
    memberSince: "January 2024",
  },
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const username = formData.get("username")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  const user = USERS[username];
  if (!user || user.password !== password) {
    return NextResponse.redirect(
      new URL("/login?error=invalid", request.url),
      { status: 303 }
    );
  }

  await setSession({
    username,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    memberSince: user.memberSince,
  });

  return NextResponse.redirect(new URL("/profile", request.url), {
    status: 303,
  });
}
