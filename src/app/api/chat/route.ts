import { NextRequest, NextResponse } from 'next/server';
import { getBuddyExplanation, testGeminiKey } from '@/lib/ai-buddy';

export async function GET(req: NextRequest) {
  // Reading req ensures the handler is evaluated dynamically
  const url = req.nextUrl;
  const envKey = (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();
  const hasEnvKey = envKey.length > 0;
  const maskedKey = hasEnvKey
    ? `${envKey.substring(0, 7)}...${envKey.substring(envKey.length - 4)}`
    : null;

  return NextResponse.json({
    hasEnvKey,
    maskedKey,
    provider: hasEnvKey ? 'gemini' : 'local',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const envKey = (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();
    const keyToUse = (body.apiKey ? body.apiKey.trim() : '') || envKey;

    // Check if client is testing key connection
    if (body.action === 'test_key') {
      const testResult = await testGeminiKey(keyToUse);
      return NextResponse.json(testResult);
    }

    const { oldPlan, newPlan, diff, reason, userMessage } = body;

    const result = await getBuddyExplanation({
      oldPlan,
      newPlan,
      diff,
      reason: reason || 'Academic plan re-evaluation',
      userMessage,
      apiKey: keyToUse,
    });

    return NextResponse.json({
      success: true,
      explanation: result.text,
      provider: result.provider,
      modelUsed: result.modelUsed,
      usedLiveLlm: result.provider === 'gemini',
      apiError: result.error,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
