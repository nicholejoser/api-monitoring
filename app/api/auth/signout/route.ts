import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createUserLog } from "@/lib/logs";
import { getCurrentUser } from "@/lib/auth";
import { tripleEncode } from "@/lib/utils";
import { getRequestInfo } from "../../users/route";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const kill = tripleEncode("kill");

  // Delete authentication cookie
  cookieStore.set(kill, "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  cookieStore.delete(kill);

  const { ipAddress, userAgent } = getRequestInfo(req);

  if (currentUser) {
    await createUserLog({
      userId: currentUser.id,
      action: "SIGN_OUT",
      description: "Successfully signed out of the system.",
      ipAddress,
      userAgent,
    });
  }

  return NextResponse.json({
    message: "Logged out successfully",
  });
}
