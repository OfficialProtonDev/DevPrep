import { NextResponse } from 'next/server';
import { getRandomProblem } from '@/lib/leetcode/server';

export async function GET() {
  try {
    const problem = await getRandomProblem();
    return NextResponse.json(problem);
  } catch (error) {
    console.error('Error fetching random problem:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
