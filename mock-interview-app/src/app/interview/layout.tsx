import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mock Interview | DevPrep",
  description: "Take part in an AI-powered mock interview.",
};

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}