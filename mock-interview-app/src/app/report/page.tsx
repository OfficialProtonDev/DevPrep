"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Message, PerformanceReport } from "@/lib/openai/types";
import { LeetCodeProblemDetail } from "@/lib/leetcode/types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export default function ReportPage() {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateReport = async () => {
      try {
        setLoading(true);

        const messagesJson = localStorage.getItem('messages');
        const problemJson = localStorage.getItem('problem');
        const userCodeJson = localStorage.getItem('userCode');
        const interviewTimeJson = localStorage.getItem('interviewTime');

        const messages: Message[] = messagesJson ? JSON.parse(messagesJson) : [];
        const userCode: string = userCodeJson ? JSON.parse(userCodeJson) : [];
        const problem: LeetCodeProblemDetail = problemJson ? JSON.parse(problemJson) : [];
        const interviewTime = interviewTimeJson ? JSON.parse(interviewTimeJson) : 1800; // Default to 30 minutes if not found
        
        // Generate the report using API
        const response = await fetch('/api/report/performance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            problem,
            userCode,
            messages,
            interviewTime
          })
        });

        if (!response.ok) {
          throw new Error('Failed to generate report');
        }

        const generatedReport = await response.json();
        
        setReport(generatedReport);
        setLoading(false);
      } catch (error) {
        console.error("Error generating report:", error);
        setLoading(false);
      }
    };
    
    generateReport();
  }, []);

  // Helper function to render score bars
  const ScoreBar = ({ label, score }: { label: string; score: number }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{score}/100</span>
      </div>
      <Progress value={score} className="h-2" />
    </div>
  );

  if (loading || !report) {
    return (
      <div className="container mx-auto p-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold">Generating Your Interview Report...</h1>
          <p className="text-gray-500 mt-2">
            Please wait while we analyze your performance
          </p>
          <Progress value={50} className="h-2 mt-8" />
        </div>
      </div>
    );
  }

  const interviewTime = localStorage.getItem('interviewTime') ? JSON.parse(localStorage.getItem('interviewTime') as string) : 1800;
  const userCode: string = localStorage.getItem('userCode') ? JSON.parse(localStorage.getItem('userCode') as string) : ""; 

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Interview Performance Report</h1>
          <p className="text-gray-500 mt-2">
            Review your performance and get insights to improve your interview skills
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Problem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.problemName}</div>
              <Badge className="mt-1" variant={
                report.problemDifficulty === "Easy" ? "success" : 
                report.problemDifficulty === "Medium" ? "warning" : 
                "destructive"
              }>{report.problemDifficulty}</Badge>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor(interviewTime / 60)}:{interviewTime % 60 < 10 ? '0' : ''}{interviewTime % 60}
              </div>
              <p className="text-sm text-gray-500 mt-2">{report.communicationEfficiency}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.overallScore}/100</div>
              <Progress value={report.overallScore} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
            <CardDescription>Detailed analysis of your interview performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScoreBar label="Problem Understanding" score={report.problemUnderstanding} />
            <ScoreBar label="Code Quality" score={report.codeQuality} />
            <ScoreBar label="Communication Skills" score={report.communicationSkills} />
            <ScoreBar label="Optimization Skills" score={report.optimizationSkills} />
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detailed Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.feedback.map((item, index) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{item.category}</h3>
                    <Badge variant={item.score >= 85 ? "success" : item.score >= 70 ? "default" : "destructive"}>
                      {item.score}/100
                    </Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{item.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              {report.improvementAreas.map((area, index) => (
                <li key={index} className="text-gray-600 dark:text-gray-400">{area}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Solution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-x-auto">
              <SyntaxHighlighter
                style={dracula}
                language="python"
                customStyle={{
                  fontSize: "0.85em",
                  width: "100%",
                  wordBreak: "break-word"
                }}
              >
                {userCode}
              </SyntaxHighlighter>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-4">
          <Button asChild>
            <Link href="/interview">Try Another Interview</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
