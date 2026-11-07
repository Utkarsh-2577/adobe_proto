import { NextRequest, NextResponse } from 'next/server';
import { getBuddyExplanation } from '@/lib/ai-buddy';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { oldPlan, newPlan, diff, reason, userMessage, apiKey } = body;

    const keyToUse = apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    const explanation = await getBuddyExplanation({
      oldPlan,
      newPlan,
      diff,
      reason: reason || 'Academic plan re-evaluation',
      userMessage,
      apiKey: keyToUse,
    });

    return NextResponse.json({
      success: true,
      explanation,
      usedLiveLlm: Boolean(keyToUse),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
