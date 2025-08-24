import { LeetCodeProblemDetail } from "../leetcode/types";
import { Message, InterviewContext, PerformanceReport, RateLimitInfo, GroqRateLimitInfo } from "./types";

/**
 * Groq API service for the AI interviewer
 */

/**
 * System prompt template for the AI interviewer
 */
const getSystemPrompt = (context: InterviewContext): string => {
  return `You are an experienced technical interviewer named Leet conducting a coding interview. 
The candidate is working on the following LeetCode problem:

Problem: ${context.problemTitle} (${context.problemDifficulty})
${context.problemDescription}

Your current stage in the interview is: ${context.interviewStage}

Guidelines for each interview stage:
- introduction: Introduce yourself briefly and explain the interview process, do not present the problem to the user, simply state that it is displayed on the side.
- problem-solving: Ask clarifying questions, guide the candidate through their theoretical approach, provide hints if they're stuck (but don't give away the solution), when they are ready to write code, prompt them to use the code editor tab.
- code-review: Review the candidate's code, ask about time/space complexity, suggest optimizations, and discuss edge cases.
- follow-up: Ask follow-up questions to test deeper understanding, discuss alternative approaches, and explore related concepts, ensure you ask at least one thought provoking follow-up question, don't dive too deep in this stage, keep it short.
- conclusion: Thank the candidate, and ask if they have any other questions or if you may conclude the interview.
- finished: Simply state the interview is finished and a report is processing.

Your responses should be:
1. Conversational and encouraging
2. Technical but clear
3. Focused on the candidate's thought process
4. Realistic to how a human interviewer would respond
5. Unforgiving

Current language: ${context.language} (ENSURE that when writing any code you correctly specify the language)

Remember, you're evaluating:
- Problem-solving approach
- Technical communication
- Code quality and correctness
- Optimization skills
- Handling of edge cases`;
};

const getStageContextPrompt = (context: InterviewContext): string => {
  return `You are a stage-defining agent observing an experienced technical interviewer conducting a coding interview. 
The candidate is working on the following LeetCode problem:

Problem: ${context.problemTitle} (${context.problemDifficulty})
${context.problemDescription}

The current supposed stage in the interview is: ${context.interviewStage}

The different stages are:
- introduction: The interviewer should have introduced themself.
- problem-solving: The interviewer should be guiding the user through their theoretical approach, asking clarifying questions, etc.
- code-review: The interviewer should be providing a review on specific code provided by the user, suggesting optimizations, discussing edge cases, and leading the user to a satisfactory solution.
- follow-up: The interviewer should be satisfied with the complete code solution provided by the user, but should be asking follow up questions to gauge their deeper understanding of related concepts or alternative approaches.
- conclusion: The interviewer should be providing constructive feedback, summarizing strengths and areas for improvement, and thanking the candidate, then asking if they have any other questions or if the interviewer may conclude the interview.
- finished: The interviewer should have received confirmation to conclude the interview from the user.

Please use the user and interviewer's last message to determine if the stage should be updated from ${context.interviewStage} to a further stage, assuming the interviewer is about to respond based on the stage you return.

Respond with ONLY ONE of the following stage names listed above. DO NOT explain or say anything else. Your answer must be EXACTLY one of these strings. No punctuation. No additional commentary. No quotation marks.

Interviewer and user's latest messages follow:`;
};

/**
 * Groq API client for generating interviewer responses
 */
export async function generateInterviewerResponse(
  messages: Message[],
  context: InterviewContext
): Promise<[string, string, GroqRateLimitInfo | null]> {
  try {
    // Validate inputs
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages format');
    }
    
    if (!context || typeof context !== 'object') {
      throw new Error('Invalid context format');
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('API key missing');
    }

    const stageContextPrompt = getStageContextPrompt(context);
    const stageContextMessages: Message[] = [
      { role: 'system', content: stageContextPrompt },
      ...(
        messages.length >= 2
          ? [
              {
                role: 'user' as Message["role"],
                content: `Interviewer: ${messages[messages.length - 2].content}`
              },
              {
                role: 'user' as Message["role"],
                content: `Candidate: ${messages[messages.length - 1].content}`
              }
            ]
          : []
      )
    ];
    
    // Make the API request to Groq
    const stageResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: stageContextMessages,
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 50
      })
    });
    
    const stageData = await stageResponse.json();

    if (!stageResponse.ok) {
      console.error('Groq API error:', stageData);
      throw new Error(`Groq API error: ${stageData.error?.message || 'Unknown error'}`);
    }
    
    if (!stageData.choices || !stageData.choices[0]) {
      console.error('Invalid response format:', stageData);
      throw new Error('Invalid response format from Groq API');
    }

    const stage = stageData.choices[0].message.content.replace(/\n/g, '').trim();

    context.interviewStage = stage;
    console.log(context.interviewStage);
    
    // Prepare the messages array with the system prompt
    const systemPrompt = getSystemPrompt(context);
    const allMessages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];
    
    // Make the API request to Groq
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: allMessages,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_completion_tokens: 750
      })
    });
    
    const data = await response.json();
    
    // Extract rate limit headers from main response request
    const responseRateLimitInfo: RateLimitInfo = {
      remainingRequests: response.headers.get('x-ratelimit-remaining-requests'),
      remainingTokens: response.headers.get('x-ratelimit-remaining-tokens'),
      resetRequests: response.headers.get('x-ratelimit-reset-requests'),
      resetTokens: response.headers.get('x-ratelimit-reset-tokens'),
      limitRequests: response.headers.get('x-ratelimit-limit-requests'),
      limitTokens: response.headers.get('x-ratelimit-limit-tokens'),
      requestId: response.headers.get('x-request-id'),
      model: 'llama-3.3-70b-versatile'
    };
    
    if (!response.ok) {
      console.error('Groq API error:', data);
      throw new Error(`Groq API error: ${data.error?.message || 'Unknown error'}`);
    }
    
    const reply = data.choices[0].message.content;

    // Combine rate limit information from both requests
    const rateLimitInfo: GroqRateLimitInfo = {
      responseModel: responseRateLimitInfo,
      timestamp: Date.now()
    };

    console.log(rateLimitInfo);

    return [reply, stage, rateLimitInfo];
  } catch (error) {
    console.error('Error generating interviewer response:', error);
    return ["I'm having trouble connecting to my knowledge base.", "introduction", null];
  }
}

export async function evaluatePerformance(
  problem: LeetCodeProblemDetail,
  userCode: string,
  messages: Message[],
  interviewDuration: number
): Promise<PerformanceReport> {
  try {
    // Validate inputs
    if (!problem || typeof problem !== 'object') {
      throw new Error('Invalid problem format');
    }
    
    if (typeof userCode !== 'string') {
      throw new Error('Invalid userCode format');
    }
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages format');
    }
    
    if (typeof interviewDuration !== 'number') {
      throw new Error('Invalid interviewDuration format');
    }
    
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('API key missing');
    }

    // Build the evaluation prompt that instructs the LLM to return a JSON performance report.
    const evaluationPrompt = `
      You are a technical interviewer evaluating a candidate's performance on a LeetCode problem.

      Problem Details:
      Title: ${problem.title}
      Difficulty: ${problem.difficulty}
      Description: ${problem.content}

      Candidate's code:
      ${userCode}

      Interview Messages:
      ${messages.map((m) => `${m.role}: ${m.content}`).join('\n')}

      Interview Duration in seconds: ${interviewDuration}

      Please analyze the communication efficiency based on:
      1. The duration of the interview
      2. The quality and depth of the conversation
      3. The candidate's ability to communicate effectively
      4. The balance between speed and thoroughness

      Please provide an evaluation report in JSON format matching exactly the following structure:
      {
        "overallScore": number,
        "problemUnderstanding": number,
        "codeQuality": number,
        "communicationSkills": number,
        "optimizationSkills": number,
        "feedback": [
          {
            "category": string,
            "comment": string,
            "score": number
          }
        ],
        "improvementAreas": [string],
        "problemName": string,
        "problemDifficulty": string,
        "communicationEfficiency": string
      }

      The communicationEfficiency field should be a concise 2-3 word assessment of how well the candidate balanced speed and thoroughness in their communication. For example:
      - "Impressively efficient communication"
      - "Rather inefficient communication"
      - "Balanced discussion"
      - "Quick but thorough"
      - "Detailed but slow"

      Ensure that:
      - All numbers are realistic (but unforgiving) scores between 0 and 100 (where applicable).
      - Improvement areas are presented as human-readable strings.
      - The JSON output is valid and parseable, with nothing outside the \`\`\`json\`\`\` tags.
    `;

    // Wrap the evaluation prompt in a system message array for the API.
    const evaluationMessages: Message[] = [
      { role: 'system', content: evaluationPrompt }
    ];

    // Make the API request to Groq to generate the evaluation report.
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: evaluationMessages,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_completion_tokens: 700
      })
    });

    // Parse the response from the LLM API.
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    const data = await response.json();
    
    // Assuming the LLM returns the JSON evaluation as a plain text message.
    const evaluationOutput = data.choices[0].message.content.trim();
    let cleanOutput = evaluationOutput.replace(/^\s*[\r\n]+|\s*[\r\n]+$/g, '');
    console.log(cleanOutput);
    cleanOutput = cleanOutput.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, '').trim();

    console.log(cleanOutput);

    let report: PerformanceReport;
    try {
      report = JSON.parse(cleanOutput);
    } catch {
      console.error("Failed to parse evaluation output as JSON");
      throw new Error("Invalid JSON format");
    }
    
    return report;
  } catch (error) {
    console.error('Error evaluating performance:', error);
    throw error;
  }
}