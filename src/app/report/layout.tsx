import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interview Performance Report | DevPrep",
  description: "Review and improve your interview performance based on AI feedback.",
};

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}