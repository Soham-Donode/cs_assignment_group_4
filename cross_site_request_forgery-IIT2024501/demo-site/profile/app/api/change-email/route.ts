import { getSession, updateSession } from "@/lib/session";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // ----------------------------------------------------------

  // fix: We compare if the request has come from the same site or it is a cross-site request, and if it is,
  // it is blocked and error 403 is returned.

  // const fetchSite = request.headers.get("sec-fetch-site");
  // const source =
  //   request.headers.get("origin") ?? request.headers.get("referer");
  // const sameOrigin = source
  //   ? new URL(source).host === new URL(request.url).host
  //   : false;
  
  // if (fetchSite ? fetchSite !== "same-origin" : !sameOrigin) {
  //   return NextResponse.json(
  //     { error: "cross site request blocked" },
  //     { status: 403 }
  //   );
  // }

  // ----------------------------------------------------------

  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const newEmail = searchParams.get("email");

  if (!newEmail || !newEmail.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  await updateSession({ email: newEmail });

  return NextResponse.json({
    message: "Email updated successfully",
    email: newEmail,
  });
}
