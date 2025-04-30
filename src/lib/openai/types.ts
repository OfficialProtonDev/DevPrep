export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface InterviewContext {
  problemTitle: string;
  problemDifficulty: string;
  problemDescription: string;
  userCode: string;
  language: string;
  interviewStage: 'introduction' | 'problem-solving' | 'code-review' | 'follow-up' | 'conclusion' | 'finished';
}

export interface PerformanceReport {
  overallScore: number;
  problemUnderstanding: number;
  codeQuality: number;
  communicationSkills: number;
  optimizationSkills: number;
  feedback: Array<{
    category: string;
    comment: string;
    score: number;
  }>;
  improvementAreas: string[];
  problemName: string;
  problemDifficulty: string;
  communicationEfficiency: string;
}

// Add rate limit types
export interface RateLimitInfo {
  remainingRequests: string | null;
  remainingTokens: string | null;
  resetRequests: string | null;
  resetTokens: string | null;
  limitRequests: string | null;
  limitTokens: string | null;
  requestId: string | null;
  model: string;
}

export interface GroqRateLimitInfo {
  stageModel: RateLimitInfo;
  responseModel: RateLimitInfo;
  timestamp: number;
}
