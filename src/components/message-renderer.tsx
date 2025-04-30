import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';

type MarkdownRendererProps = {
  children: string;
};
  
export function MarkdownRenderer({ children: markdown }: MarkdownRendererProps) {
  return (
    <div style={{ 
      wordBreak: "break-word", 
      overflowWrap: "break-word", 
      whiteSpace: "pre-wrap", 
      maxWidth: "100%",
      overflow: "hidden" 
    }}>
      <Markdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ inline, className, children, ...props }: {
            inline?: boolean;
            className?: string;
            children?: React.ReactNode;
          }) {
            const match = /language-(\w+)/.exec(className || '');

            return !inline && match ? (
              <div style={{ maxWidth: "100%", overflow: "hidden" }}>
                <SyntaxHighlighter 
                  style={dracula} 
                  PreTag="div" 
                  language={match[1]} 
                  {...props}
                  wrapLongLines={true}
                  customStyle={{ 
                    maxWidth: "100%", 
                    overflowX: "auto",
                    fontSize: "0.85em", // Smaller font size for code blocks
                    width: "100%", // Ensure code block doesn't expand beyond container
                    wordBreak: "break-word"
                  }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code 
                className={className} 
                style={{ 
                  wordBreak: "break-word", 
                  overflowWrap: "break-word" 
                }} 
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({children, ...props}) => (
            <pre 
              style={{ 
                maxWidth: "100%", 
                overflow: "auto",
                margin: "0",  // Remove margin to avoid overflow
                width: "100%" // Ensure pre element doesn't expand beyond container
              }} 
              {...props}
            >
              {children}
            </pre>
          ),
        }}
      >
        {markdown}
      </Markdown>
    </div>
  );
}