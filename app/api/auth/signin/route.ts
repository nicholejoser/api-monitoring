import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { tripleEncode } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getRequestInfo } from "../../users/route";
import { createUserLog } from "@/lib/logs";
import { signToken } from "@/lib/auth";

// FiberVu authentication
async function fiberVuLogin() {
  const targetUrl = process.env.FIBERVU_LOGIN_URL;

  const username = process.env.FIBERVU_USERNAME;
  const password = process.env.FIBERVU_PASSWORD;

  if (!targetUrl || !username || !password) {
    throw new Error("FiberVu authentication configuration is missing.");
  }

  const payload = {
    username,
    password,
  };

  const res = await fetch(targetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`FiberVu authentication failed: ${res.status}`);
  }

  return data;
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        {
          message: "Username and password are required.",
        },
        {
          status: 400,
        },
      );
    }

    // Local authentication
    const user = await prisma.users.findUnique({
      where: {
        username,
      },
      include: {
        roles: true,
      },
    });
    console.log(user);

    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid username or password.",
        },
        {
          status: 401,
        },
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        {
          message: "Invalid username or password.",
        },
        {
          status: 401,
        },
      );
    }

    // FiberVu authentication
    const fiberVuData = await fiberVuLogin();

    // JWT expiration based on role
    const maxAgeByRole: Record<string, number> = {
      "Super Admin": 60 * 60 * 24,
      Admin: 60 * 60 * 8,
      User: 60 * 60,
    };

    const maxAge = maxAgeByRole[user.roles.role] ?? 60 * 60;

    // Generate local JWT
    const token = signToken(
      {
        id: user.id,
        email: user.email,
        role: user.role_id,
      },
      `${maxAge}s`,
    );

    // Response
    const response = NextResponse.json({
      message: "Login successful.",
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.roles.role,
      },
      fiberVu: fiberVuData,
    });

    // Authentication cookie
    const cookieName = tripleEncode("kill");

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    // User activity log
    const { ipAddress, userAgent } = getRequestInfo(req);

    await createUserLog({
      userId: user.id,
      action: "SIGN_IN",
      description: "Successfully signed in to the system.",
      ipAddress,
      userAgent,
    });
    return response;
  } catch (error) {
    console.error("Login Error:", error);

    return NextResponse.json(
      {
        message: "Login failed.",
      },
      {
        status: 500,
      },
    );
  }
}
