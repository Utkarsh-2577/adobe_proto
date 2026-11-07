import { NextRequest, NextResponse } from 'next/server';
import { getBuddyExplanation, testGeminiKey } from '@/lib/ai-buddy';

export async function GET() {
  const hasEnvKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  return NextResponse.json({
    hasEnvKey,
    provider: hasEnvKey ? 'gemini' : 'local',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if client is testing key connection
    if (body.action === 'test_key') {
      const keyToTest = body.apiKey || process.env.GEMINI_API_KEY || '';
      const testResult = await testGeminiKey(keyToTest);
      return NextResponse.json(testResult);
    }

    const { oldPlan, newPlan, diff, reason, userMessage, apiKey } = body;
    const keyToUse = apiKey || process.env.GEMINI_API_KEY;

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
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
