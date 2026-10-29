import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
/**
 * Strongly typed JWT payload
 */
export interface AuthTokenPayload extends JwtPayload {
  id: number;
  email: string;
  role: number;
}

/**
 * Safely get secret (TypeScript safe)
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return secret;
}

/**
 * Sign Token
 */
export function signToken(
  payload: AuthTokenPayload,
  expiresIn: SignOptions["expiresIn"] = "1d",
): string {
  const options: SignOptions = {
    expiresIn,
  };

  return jwt.sign(payload, getJwtSecret(), options);
}

/**
 * Verify Token
 */
export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const kill = process.env.KILL;
  if (!kill) {
    throw new Error("Kill is missing to verify current user.");
  }
  const token = (await cookies()).get(kill)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = verifyToken(token);

    if (!payload) {
      return null;
    }
    return await prisma.users.findUnique({
      where: {
        id: Number(payload.id),
      },
      include: {
        roles: true,
      },
    });
  } catch {
    return null;
  }
}

export async function requireRole(allowedRoles: string[]) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const userRole = user.roles?.role;

  if (!userRole || !allowedRoles.includes(userRole)) {
    redirect("/dashboard");
  }

  return user;
}
