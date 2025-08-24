"use client";

import { useState, useEffect } from 'react';
import { GroqRateLimitInfo } from '@/lib/openai/types';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RateLimitTrackerProps {
  rateLimitInfo: GroqRateLimitInfo | null;
}

export function RateLimitTracker({ rateLimitInfo }: RateLimitTrackerProps) {
  const [timeUntilReset, setTimeUntilReset] = useState<{ requests: string; tokens: string }>({
    requests: '--:--',
    tokens: '--:--'
  });
  
  // Store the initial reset times and timestamp when they were received
  const [initialResetData, setInitialResetData] = useState<{
    tokenResetSeconds: number;
    timestamp: number;
  } | null>(null);
  
  // Create a state to track whether tokens have been reset
  const [tokensReset, setTokensReset] = useState(false);

  useEffect(() => {
    if (!rateLimitInfo) return;

    // When we get new rate limit info, store the initial values
    const tokensResetTime = rateLimitInfo.responseModel.resetTokens;
    
    const parseResetTime = (time: string | null): number => {
      if (!time) return 0;
      return parseFloat(time.replace('s', ''));
    };
    
    const tokenResetSeconds = Math.max(
      parseResetTime(tokensResetTime)
    );

    setInitialResetData({
      tokenResetSeconds,
      timestamp: Date.now()
    });
    
    // Reset the tokensReset flag when we get new rate limit info
    setTokensReset(false);
    
  }, [rateLimitInfo]);

  useEffect(() => {
    if (!initialResetData) return;

    const updateTimeUntilReset = () => {
      const now = Date.now();
      const elapsedSeconds = (now - initialResetData.timestamp) / 1000;
      const remainingSeconds = Math.max(0, initialResetData.tokenResetSeconds - elapsedSeconds);
      
      if (remainingSeconds <= 0) {
        setTimeUntilReset({
          requests: '--:--',
          tokens: '00:00'
        });
        
        // Set tokens reset flag to true when countdown reaches zero
        setTokensReset(true);
        return;
      }
      
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = Math.floor(remainingSeconds % 60);
      
      setTimeUntilReset({
        requests: '--:--',
        tokens: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      });
    };

    // Update immediately and then every second
    updateTimeUntilReset();
    const interval = setInterval(updateTimeUntilReset, 1000);
    
    return () => clearInterval(interval);
  }, [initialResetData]);

  if (!rateLimitInfo) return null;

  // Calculate percentages for progress bars
  const calculatePercentage = (remaining: string | null, limit: string | null): number => {
    if (!remaining || !limit) return 100;
    
    // If tokens have been reset, return 100% (full)
    if (tokensReset) return 100;
    
    const remainingNum = parseInt(remaining);
    const limitNum = parseInt(limit);
    return Math.min(100, Math.max(0, (remainingNum / limitNum) * 100));
  };
  
  const tokensPercentage = calculatePercentage(
    rateLimitInfo.responseModel.remainingTokens,
    rateLimitInfo.responseModel.limitTokens
  );

  // Determine status colors
  const getStatusColor = (percentage: number): string => {
    if (percentage < 20) return 'bg-red-500';
    if (percentage < 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Groq API Token Limits</CardTitle>
          <div className="flex space-x-2">
            <Badge variant="outline" className="text-xs">
              Reset in {timeUntilReset.tokens}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Response Model Tokens ({rateLimitInfo.responseModel.model})</span>
            <span>
              {tokensReset 
                ? rateLimitInfo.responseModel.limitTokens || '0' 
                : rateLimitInfo.responseModel.remainingTokens || '0'}/{rateLimitInfo.responseModel.limitTokens || '0'}
            </span>
          </div>
          <Progress value={tokensPercentage} className={`h-2 ${getStatusColor(tokensPercentage)}`} />
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          <p>Last updated: {new Date(rateLimitInfo.timestamp).toLocaleTimeString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
