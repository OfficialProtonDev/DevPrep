import { NextResponse } from 'next/server';
import { generateInterviewerResponse } from '@/lib/openai/server';

export async function POST(request: Request) {
  try {
    const { messages, context } = await request.json();
    
    // Validate input
    if (!messages || !Array.isArray(messages) || !context || typeof context !== 'object') {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }
    
    const [reply, stage, rateLimitInfo] = await generateInterviewerResponse(messages, context);
    return NextResponse.json([reply, stage, rateLimitInfo]);
  } catch (error) {
    console.error('Error in interviewer API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
