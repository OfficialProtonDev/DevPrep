import { NextResponse } from 'next/server';
import { evaluatePerformance } from '@/lib/openai/server';

export async function POST(request: Request) {
  try {
    const { problem, userCode, messages, interviewTime } = await request.json();
    
    // Validate input
    if (!problem || typeof problem !== 'object' || 
        typeof userCode !== 'string' || 
        !messages || !Array.isArray(messages) || 
        typeof interviewTime !== 'number') {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    const report = await evaluatePerformance(
      problem,
      userCode,
      messages,
      interviewTime
    );

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating performance report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
