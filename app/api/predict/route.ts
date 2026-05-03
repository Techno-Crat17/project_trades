import { NextResponse } from 'next/server';
import { mockInsights } from '@/lib/mock-insights';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const country = body.country ?? 'India';
  const insight = mockInsights[country];
  if (!insight) {
    return NextResponse.json({ error: 'Country not found' }, { status: 404 });
  }
  await new Promise((r) => setTimeout(r, 400));
  return NextResponse.json(insight);
}
