"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Card, CardContent } from "@/components/ui/card";

// Utility to highlight roles like Claimant, Defendant, Witness with badges
const highlightRole = (text: string) => {
  if (text.includes("(Claimant)")) {
    return text.replace(
      "(Claimant)",
      '<span class="ml-2 inline-block rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">Claimant</span>'
    );
  }
  if (text.includes("(Defendant)")) {
    return text.replace(
      "(Defendant)",
      '<span class="ml-2 inline-block rounded bg-red-100 px-2 py-0.5 text-xs text-red-800">Defendant</span>'
    );
  }
  if (text.includes("(Witness)")) {
    return text.replace(
      "(Witness)",
      '<span class="ml-2 inline-block rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">Witness</span>'
    );
  }
  return text;
};

interface StyledMarkdownRendererProps {
  content: string;
}

export default function StyledMarkdownRenderer({ content }: StyledMarkdownRendererProps) {
  // Split by '## ' to wrap each section in a Card
  const sections = content.split(/\n## /).filter(Boolean);

  return (
    <div className="space-y-6">
      {sections.map((section, index) => {
        // Add back the '##' we removed when splitting
        const reconstructed = index === 0 ? section : "## " + section;

        return (
          <Card key={index}>
            <CardContent className="prose prose-sm max-w-none px-6 py-4">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h2: (props) => (
                    <h2 className="text-center text-2xl font-bold my-4" {...props} />
                  ),
                  h3: (props) => (
                    <h3 className="text-center text-xl font-semibold my-2 text-gray-700" {...props} />
                  ),
                  ul: (props) => (
                    <ul className="list-disc list-inside space-y-1" {...props} />
                  ),
                  li: ({ children, ...props }) => {
                    const processed = highlightRole(String(children));
                    return (
                      <li
                        {...props}
                        className="text-sm"
                        dangerouslySetInnerHTML={{ __html: processed }}
                      />
                    );
                  },
                  p: (props) => (
                    <p className="text-justify my-2 text-sm leading-relaxed" {...props} />
                  ),
                }}
              >
                {reconstructed}
              </ReactMarkdown>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
