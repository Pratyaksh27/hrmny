"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { Card } from "@/components/ui/card";
import { TranscriptItem } from "@/app/types";

export default function Transcript() {
  const { transcriptItems, toggleTranscriptItemExpand } = useTranscript();
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const [prevLogs, setPrevLogs] = useState<TranscriptItem[]>([]);

  // Scroll to bottom if new or updated messages arrive
  useEffect(() => {
    const hasNewMessage = transcriptItems.length > prevLogs.length;
    const hasUpdatedMessage = transcriptItems.some((newItem, i) => {
      const oldItem = prevLogs[i];
      return oldItem && (newItem.title !== oldItem.title || newItem.data !== oldItem.data);
    });

    if (hasNewMessage || hasUpdatedMessage) {
      transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
    }

    setPrevLogs(transcriptItems);
  }, [transcriptItems, prevLogs]);

  return (
    <Card className="mt-6 h-[400px] overflow-y-auto p-4 space-y-4" ref={transcriptRef}>
      {transcriptItems.map((item) => {
        const {
          itemId,
          type,
          role,
          data,
          expanded,
          timestamp,
          title = "",
          isHidden,
          guardrailResult,
        } = item;

        if (isHidden) return null;

        if (type === "MESSAGE") {
          const isUser = role === "user";
          const messageClasses = isUser
            ? "bg-gray-900 text-white"
            : "bg-muted text-black";

          const isBracketed = title.startsWith("[") && title.endsWith("]");
          const displayTitle = isBracketed ? title.slice(1, -1) : title;

          return (
            <div key={itemId} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className={`rounded-xl p-3 max-w-md ${messageClasses}`}>
                <div className="text-xs text-muted-foreground font-mono mb-1">{timestamp}</div>
                <div className={`text-sm whitespace-pre-wrap ${isBracketed ? "italic text-muted-foreground" : ""}`}>
                  <ReactMarkdown>{displayTitle}</ReactMarkdown>
                </div>
              </div>
            </div>
          );
        }

        if (type === "BREADCRUMB") {
          return (
            <div key={itemId} className="text-sm text-gray-700 font-mono">
              <div className="text-xs text-gray-400 mb-1">{timestamp}</div>
              <div
                onClick={() => data && toggleTranscriptItemExpand(itemId)}
                className={`cursor-pointer flex items-start gap-1 ${data ? "hover:text-blue-600" : ""}`}
              >
                {data && (
                  <span className={`transition-transform ${expanded ? "rotate-90" : "rotate-0"}`}>
                    ▶
                  </span>
                )}
                {title}
              </div>
              {expanded && data && (
                <pre className="mt-2 ml-3 border-l-2 border-gray-200 pl-2 text-xs whitespace-pre-wrap break-words text-gray-800">
                  {JSON.stringify(data, null, 2)}
                </pre>
              )}
            </div>
          );
        }

        // fallback
        return (
          <div key={itemId} className="text-center text-muted-foreground text-sm font-mono italic">
            Unknown item type: {type} <span className="ml-2 text-xs">{timestamp}</span>
          </div>
        );
      })}
    </Card>
  );
}
