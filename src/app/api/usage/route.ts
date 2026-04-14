import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');

  if (!apiKey) return NextResponse.json({ usage: [] }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { api_key: apiKey },
  });

  if (!user) return NextResponse.json({ usage: [] }, { status: 401 });

  const usageLogs = await prisma.apiUsage.findMany({
    where: { user_id: user.id },
    orderBy: { timestamp: 'desc' },
    take: 20 // Show last 20 requests
  });

  return NextResponse.json({
    usage: usageLogs,
    plan: user.subscription_plan
  });
}