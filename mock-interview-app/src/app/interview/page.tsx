"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

import { LeetCodeProblemDetail } from "@/lib/leetcode/types";
import { Message, InterviewContext, GroqRateLimitInfo } from "@/lib/openai/types";

import { MarkdownRenderer } from "@/components/message-renderer"
import { RateLimitTracker } from "@/components/rate-limit-tracker";

// Import Monaco Editor dynamically (it only runs on the client)
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

// Helper to run code via the Piston API
const runCodeWithPiston = async (code: string, language: string, version: string) => {
  const response = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language,
      version,
      files: [{ name: "main.py", content: code }],
    }),
  });
  const result = await response.json();
  return result;
};

export default function InterviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState<LeetCodeProblemDetail>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [currentTab, setCurrentTab] = useState("chat");
  const [progress, setProgress] = useState(0);
  const [interviewStage, setInterviewStage] = useState<InterviewContext["interviewStage"]>("introduction");
  const [userCode, setUserCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [interviewTime, setInterviewTime] = useState(0);
  const interviewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<GroqRateLimitInfo | null>(null);

  // New states:
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [runtimes, setRuntimes] = useState<Array<{language: string; version: string}>>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [selectedVersion, setSelectedVersion] = useState("3.10.0");
  const [consoleOutput, setConsoleOutput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const [leftPanelHeight, setLeftPanelHeight] = useState(100);

  useEffect(() => {
    if (!loading && leftPanelRef.current) {
      setLeftPanelHeight(leftPanelRef.current.offsetHeight);
      console.log(leftPanelHeight);
    }
  }, [loading, leftPanelHeight]);

  const validStages: InterviewContext["interviewStage"][] = [
    "introduction",
    "problem-solving",
    "code-review",
    "follow-up",
    "conclusion",
    "finished",
  ];

  // Fetch supported runtimes from Piston API on mount
  useEffect(() => {
    const fetchRuntimes = async () => {
      try {
        const res = await fetch("https://emkc.org/api/v2/piston/runtimes");
        const data = await res.json();
        setRuntimes(data);
        // If "python3" exists in data then select its first version
        const pythonRuntimes = data.filter((r: {language: string; version: string}) => r.language === "python3");
        if (pythonRuntimes.length > 0) {
          setSelectedLanguage("python3");
          setSelectedVersion(pythonRuntimes[0].version);
        }
      } catch (error) {
        console.error("Failed to fetch runtimes", error);
      }
    };
    fetchRuntimes();
  }, []);

  // Auto-scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    switch(interviewStage) {
      case "introduction": {
        setProgress(5);
        break;
      }
      case "problem-solving": {
        setProgress(20);
        break;
      }
      case "code-review": {
        setProgress(50);
        break;
      }
      case "follow-up": {
        setProgress(70);
        break;
      }
      case "conclusion": {
        setProgress(90);
        break;
      }
      case "finished": {
        setProgress(100);
        break;
      }
    }
  }, [interviewStage]);

  // When language selection changes, update version select with the first matching runtime
  useEffect(() => {
    const languageRuntimes = runtimes.filter((r) => r.language === selectedLanguage);
    if (languageRuntimes.length > 0) {
      setSelectedVersion(languageRuntimes[0].version);
    }
  }, [selectedLanguage, runtimes]);

  // Start the timer when the interview begins
  useEffect(() => {
    if (!loading && interviewStage !== "finished") {
      interviewTimerRef.current = setInterval(() => {
        setInterviewTime(prev => prev + 1); // Increment time in seconds
      }, 1000);
    }

    // Cleanup timer on component unmount or when interview is finished
    return () => {
      if (interviewTimerRef.current) {
        clearInterval(interviewTimerRef.current);
      }
    };
  }, [loading, interviewStage]);

  // Store interview time when interview is finished
  useEffect(() => {
    if (interviewStage === "finished") {
      localStorage.setItem('interviewTime', JSON.stringify(interviewTime));
    }
  }, [interviewStage, interviewTime]);

  // Send message to chat
  const handleSendMessage = async () => {
    if (userInput.trim() === "" || isProcessing) return;
    setIsProcessing(true);

    const newMessages = [...messages, { role: "user", content: userInput } as Message];
    setMessages(newMessages);
    setUserInput("");

    try {
      if (!problem) {
        throw new Error('Problem data is not available');
      }

      const context: InterviewContext = {
        problemTitle: problem.title,
        problemDifficulty: problem.difficulty,
        problemDescription: problem.content,
        userCode: userCode,
        language: selectedLanguage,
        interviewStage: interviewStage,
      };

      const response = await fetch('/api/interviewer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages, context })
    });
    const interviewerResponse = await response.json();
      setMessages([...newMessages, { role: "assistant", content: interviewerResponse[0] } as Message]);
      
      const maybeStage = interviewerResponse[1];
      const newRateLimitInfo = interviewerResponse[2];
      
      if (newRateLimitInfo) {
        setRateLimitInfo(newRateLimitInfo);
      }

      if (validStages.includes(maybeStage as InterviewContext["interviewStage"])) {
        setInterviewStage(maybeStage as InterviewContext["interviewStage"]);
      }
      else {
        console.warn("LLM returned invalid stage: " + maybeStage);
      }
    } catch (error) {
      console.error("Error generating response:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCodeChange = (code: string) => {
    setUserCode(code);
  };

  // Run and evaluate code using Piston, then send the output to the LLM
  const handleCodeEvaluation = async () => {
    setCurrentTab("chat");
    setIsRunningCode(true);
    try {
      const result = await runCodeWithPiston(userCode, selectedLanguage, selectedVersion);
      const output = result.run?.output || "No output";
      setConsoleOutput(output);

      // Fixing the template string formatting.
      const userMsg = `Here's my code:

\`\`\`${selectedLanguage}
${userCode}
\`\`\`

Output:
\`\`\`
${output}
\`\`\``;

      const newMessages = [...messages, { role: "user", content: userMsg } as Message];
      setMessages(newMessages);

      if (!problem) {
        throw new Error('Problem data is not available');
      }

      const context: InterviewContext = {
        problemTitle: problem.title,
        problemDifficulty: problem.difficulty,
        problemDescription: problem.content,
        userCode: userCode,
        language: selectedLanguage,
        interviewStage: interviewStage,
      };

      const response = await fetch('/api/interviewer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages, context })
    });
    const interviewerResponse = await response.json();
      setMessages([...newMessages, { role: "assistant", content: interviewerResponse[0] } as Message]);

      const maybeStage = interviewerResponse[1];

      if (validStages.includes(maybeStage as InterviewContext["interviewStage"])) {
        setInterviewStage(maybeStage as InterviewContext["interviewStage"]);
      }
      else {
        console.warn("LLM returned invalid stage: " + maybeStage);
      }

    } catch (error) {
      console.error("Error running code:", error);
      setConsoleOutput("Failed to run code.");
    } finally {
      setIsRunningCode(false);
    }
  };

const handleFinishInterview = () => {
  setInterviewStage("finished");
  setMessages([
    ...messages,
    {
      role: "assistant",
      content:
        `The interview is over. You completed it in ${Math.floor(interviewTime / 60)} minutes ${interviewTime % 60} seconds. Please press the button below to see your report.`,
    } as Message,
  ]);
};

const showReport = () => {
  localStorage.setItem('messages', JSON.stringify(messages));
  localStorage.setItem('userCode', JSON.stringify(userCode));
  localStorage.setItem('problem', JSON.stringify(problem));
  router.push("/report");
};

// Fetch a random problem on mount
useEffect(() => {
  const fetchProblem = async () => {
    try {
      setLoading(true);
      
      // Fetch random problem from API
      const randomResponse = await fetch('/api/leetcode/random');
      const randomProblem = await randomResponse.json();
      
      setProblem(randomProblem);

      const starterCode = randomProblem.codeSnippets.find(
        (snippet: { langSlug: string; code: string }) => 
          snippet.langSlug === 'python3'
      )?.code || '';
      setUserCode(starterCode);

      const context: InterviewContext = {
        problemTitle: randomProblem.title,
        problemDifficulty: randomProblem.difficulty,
        problemDescription: randomProblem.content,
        userCode: starterCode,
        language: selectedLanguage,
        interviewStage: 'introduction',
      };

      const response = await fetch('/api/interviewer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [], context })
      });

      const interviewerResponse = await response.json();
      
      // Initialize rate limit info from the first API call
      const newRateLimitInfo = interviewerResponse[2];
      if (newRateLimitInfo) {
        setRateLimitInfo(newRateLimitInfo);
      }
      
      // Only set loading to false after both API calls are complete
      setLoading(false);

      localStorage.setItem('messages', JSON.stringify([]));
      localStorage.setItem('userCode', JSON.stringify(""));
      localStorage.setItem('problem', JSON.stringify(randomProblem));

      setMessages([{ role: "assistant", content: interviewerResponse[0] }]);
    } catch (error) {
      console.error("Error fetching problem:", error);
      // Set loading to false on error
      setLoading(false);
      // Set a default problem if fetch fails
      setProblem({
        questionId: 0,
        title: "Loading Error",
        titleSlug: "loading-error",
        content: "There was an error loading the interview problem. Please try refreshing the page.",
        difficulty: "Easy",
        codeSnippets: [],
        examples: [],
        constraints: []
      });
    }
  };

    fetchProblem();
  }, [selectedLanguage]);

if (loading) {
  return (
    <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-2rem)]">
          <Card className="col-span-1 lg:col-span-1 h-full">
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
          <Card className="col-span-1 lg:col-span-2 h-full">
          <CardHeader>
              <Skeleton className="h-8 w-full" />
          </CardHeader>
          <CardContent>
              <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
            </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-2rem)]">
        {/* Left panel - Problem description */}
        <Card ref={leftPanelRef} className="col-span-1 lg:col-span-1 h-full flex flex-col">
          <CardHeader>
            <CardTitle>{problem?.title || "Loading problem..."}</CardTitle>
            <CardDescription>
              <Badge variant={
                problem?.difficulty === "Easy" ? "success" : 
                problem?.difficulty === "Medium" ? "warning" : 
                "destructive"
              }>
                {problem?.difficulty || "Loading..."}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                <div dangerouslySetInnerHTML={{ __html: problem?.content || "Loading problem..." }} />
                
                  <div className="space-y-4">
                    {problem?.examples.map((example: { input: string; output: string; explanation?: string }, index: number) => (
                      <div key={index} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                        <p className="font-bold">Example {index + 1}:</p>
                        <p><strong>Input:</strong> {example.input}</p>
                        <p><strong>Output:</strong> {example.output}</p>
                        {example.explanation && (
                          <p><strong>Explanation:</strong> {example.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>

                <div className="space-y-2">
                  <p className="font-bold">Constraints:</p>
                  <ul className="list-disc list-inside">
                    {problem?.constraints.map((constraint: string, index: number) => (
                      <li key={index}>{constraint}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right panel - Code editor and chat */}
        <Card className="col-span-1 lg:col-span-2 h-full flex flex-col">
          <CardContent className="flex-1 overflow-hidden">
            <Tabs defaultValue="chat" className="h-full" value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="chat">Interview Chat</TabsTrigger>
                <TabsTrigger value="problem">Code Editor</TabsTrigger>
              </TabsList>

              {/* Chat Tab */}
              <TabsContent value="chat" className="flex h-full flex-col mt-2">
                <div className="flex flex-col h-full">
                  <div className="p-4 overflow-y-auto" style={{ maxHeight: (leftPanelHeight - 350) }}>
                    <ScrollArea className="flex-1 overflow-auto">
                      <div className="space-y-4 w-full pr-4">
                        {messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} w-full`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                message.role === "user"
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-100 dark:bg-gray-800"
                              }`}
                              style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                            >
                              <div className="w-full overflow-hidden">
                                <MarkdownRenderer>
                                  {message.content}
                                </MarkdownRenderer>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </div>
                  <div className="p-4 border-t">
                    <div className="flex flex-col space-y-4">
                      <div className="flex space-x-2">
                        <Textarea
                          placeholder="Type your message..."
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="flex-grow"
                          disabled={isProcessing}
                        />
                        <Button onClick={handleSendMessage} disabled={isProcessing || !userInput.trim()}>
                          {isProcessing ? "Thinking..." : "Send"}
                        </Button>
                      </div>
                      {rateLimitInfo && (
                        <RateLimitTracker rateLimitInfo={rateLimitInfo} />
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Code Editor Tab */}
              <TabsContent value="problem" className="flex h-full flex-col mt-2">
                <div className="bg-gray-100 dark:bg-gray-800 p-2 text-sm flex gap-2 items-center">
                  <select
                    className="border rounded px-2 py-1 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  >
                    {/* Create options based on distinct languages from the fetched runtimes */}
                    {[...new Set(runtimes.map((r) => r.language))].map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                  <select
                    className="border rounded px-2 py-1 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    value={selectedVersion}
                    onChange={(e) => setSelectedVersion(e.target.value)}
                  >
                    {runtimes
                      .filter((r) => r.language === selectedLanguage)
                      .map((r) => (
                        <option key={r.version} value={r.version}>
                          {r.version}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex-grow p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 overflow-auto">
                  {/* Monaco Editor in place of textarea */}
                  <MonacoEditor
                    height="100%"
                    language={selectedLanguage === "python3" ? "python" : selectedLanguage}
                    value={userCode}
                    onChange={(newValue) => handleCodeChange(newValue || "")}
                    theme="vs-dark"
                    options={{ automaticLayout: true }}
                  />
                </div>
                <div className="p-4 border-t flex gap-2 items-center justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCodeEvaluation} disabled={isRunningCode}>
                      {isRunningCode ? "Running..." : "Evaluate Code"}
                    </Button>
                    <Button
                      onClick={async () => {
                        setIsRunningCode(true);
                        try {
                          const result = await runCodeWithPiston(userCode, selectedLanguage, selectedVersion);
                          setConsoleOutput(result.run?.output || "No output");
                        } catch {
                          setConsoleOutput("Failed to run code.");
                        } finally {
                          setIsRunningCode(false);
                        }
                      }}
                      disabled={isRunningCode}
                    >
                      {isRunningCode ? "Running..." : "Run Code"}
                    </Button>
                  </div>
                </div>
                {consoleOutput && (
                  <div className="p-4 border-t bg-black text-white font-mono text-sm overflow-auto max-h-60">
                    <p className="mb-2 font-bold">Console Output:</p>
                    <pre>{consoleOutput}</pre>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="border-t px-4 py-2 mt-auto">
            <div className="w-full space-y-2">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Interview Progress</h2>
                  <div className="text-sm text-gray-500">
                    Time: {Math.floor(interviewTime / 60)}:{interviewTime % 60 < 10 ? '0' : ''}{interviewTime % 60}
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              {progress < 90 && (
                <Button variant="outline" size="sm" className="mt-2" onClick={handleFinishInterview}>
                  Finish Interview Early
                </Button>
              )}
              {progress === 100 && (
                <Button variant="outline" size="sm" className="mt-2" onClick={showReport}>
                  View Report
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}