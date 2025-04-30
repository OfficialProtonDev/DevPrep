export interface LeetCodeProblemDetail {
  questionId: number;
  title: string;
  titleSlug: string;
  content: string;
  difficulty: string;
  codeSnippets: {
    lang: string;
    langSlug: string;
    code: string;
  }[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
}

export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';
