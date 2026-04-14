import { NextRequest } from 'next/server';
import { prisma } from './prisma';

const LIMITS: Record<string, number> = {
  free: 1000,
  pro: 10000,
  enterprise: Infinity,
};

export async function authorizeRequest(req: NextRequest, terminalNodeId?: string) {
  const startTime = Date.now();
  const apiKey = req.headers.get('x-api-key');

  if (!apiKey) return { error: "Missing API Key", status: 401 };

  // 1. Fetch User and Subscription Plan
  const user = await prisma.user.findUnique({
    where: { api_key: apiKey },
    select: { id: true, subscription_plan: true }
  });

  if (!user) return { error: "Unauthorized User", status: 401 };

  // 2. Check Daily Quota
  const usageCount = await prisma.apiUsage.count({
    where: {
      user_id: user.id,
      timestamp: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    }
  });

  if (usageCount >= LIMITS[user.subscription_plan]) {
    return { error: "Subscription quota exceeded", status: 429 };
  }

  // 3. Helper to log after the real API call finishes
  const logUsage = async (statusCode: number) => {
    await prisma.apiUsage.create({
      data: {
        user_id: user.id,
        api_key: apiKey,
        endpoint: req.nextUrl.pathname,
        method: req.method,
        status_code: statusCode,
        response_time: Date.now() - startTime,
        // Optional: you could add a 'metadata' JSON field to your schema 
        // to store the terminalNodeId specifically
      }
    });
  };

  return { user, logUsage };
}