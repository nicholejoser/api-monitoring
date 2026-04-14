import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

const LIMITS: Record<string, number> = {
  free: 1000,
  pro: 10000,
  enterprise: 999999999,
};

export async function validateAndLog(req: NextRequest) {
  const startTime = Date.now();
  const apiKey = req.headers.get('x-api-key');

  if (!apiKey) return { error: "Missing API Key", status: 401 };

  // 1. Fetch User & Subscription
  const user = await prisma.user.findUnique({
    where: { api_key: apiKey },
    select: { id: true, subscription_plan: true }
  });

  if (!user) return { error: "Invalid API Key", status: 401 };

  // 2. Check Daily Usage
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentUsage = await prisma.apiUsage.count({
    where: {
      user_id: user.id,
      timestamp: { gte: today }
    }
  });

  if (currentUsage >= LIMITS[user.subscription_plan]) {
    return { error: "Rate limit exceeded", status: 429 };
  }

  // 3. Return context for the route to use
  return { 
    user, 
    log: async (statusCode: number) => {
      await prisma.apiUsage.create({
        data: {
          user_id: user.id,
          api_key: apiKey,
          endpoint: req.nextUrl.pathname,
          method: req.method,
          status_code: statusCode,
          response_time: Date.now() - startTime
        }
      });
    }
  };
}