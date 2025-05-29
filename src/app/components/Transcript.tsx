"use-client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { TranscriptItem } from "@/app/types";

import { useTranscript } from "@/app/contexts/TranscriptContext";


function Transcript() {
    const { transcriptItems, toggleTranscriptItemExpand } = useTranscript();
    const transcriptRef = useRef<HTMLDivElement | null>(null);
    const [prevLogs, setPrevLogs] = useState<TranscriptItem[]>([]);

    function scrollToBottom() {
        if (transcriptRef.current) {
          transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }

    useEffect(() => {
        const hasNewMessage = transcriptItems.length > prevLogs.length;
        const hasUpdatedMessage = transcriptItems.some((newItem, index) => {
          const oldItem = prevLogs[index];
          return (
            oldItem &&
            (newItem.title !== oldItem.title || newItem.data !== oldItem.data)
          );
        });
    
        if (hasNewMessage || hasUpdatedMessage) {
          scrollToBottom();
        }
    
        setPrevLogs(transcriptItems);
      }, [transcriptItems, prevLogs]);

      return (
        <div className="flex flex-col flex-1 bg-white min-h-0 rounded-xl">
          <div className="flex flex-col flex-1 min-h-0">
            {/* Transcript Content */}
            Transcript
            <div
              ref={transcriptRef}
              className="overflow-auto p-4 flex flex-col gap-y-4 h-full"
            >
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
    
                if (isHidden) {
                  return null;
                }
    
                if (type === "MESSAGE") {
                  const isUser = role === "user";
                  const containerClasses = `flex justify-end flex-col ${
                    isUser ? "items-end" : "items-start"
                  }`;
                  const bubbleBase = `max-w-lg p-3 ${
                    isUser ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-black"
                  }`;
                  const isBracketedMessage =
                    title.startsWith("[") && title.endsWith("]");
                  const messageStyle = isBracketedMessage
                    ? "italic text-gray-400"
                    : "";
                  const displayTitle = isBracketedMessage
                    ? title.slice(1, -1)
                    : title;
    
                  return (
                    <div key={itemId} className={containerClasses}>
                      <div className="max-w-lg">
                        <div
                          className={`${bubbleBase} rounded-t-xl ${
                            guardrailResult ? "" : "rounded-b-xl"
                          }`}
                        >
                          <div
                            className={`text-xs ${
                              isUser ? "text-gray-400" : "text-gray-500"
                            } font-mono`}
                          >
                            {timestamp}
                          </div>
                          <div className={`whitespace-pre-wrap ${messageStyle}`}>
                            <ReactMarkdown>{displayTitle}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } else if (type === "BREADCRUMB") {
                  return (
                    <div
                      key={itemId}
                      className="flex flex-col justify-start items-start text-gray-500 text-sm"
                    >
                      <span className="text-xs font-mono">{timestamp}</span>
                      <div
                        className={`whitespace-pre-wrap flex items-center font-mono text-sm text-gray-800 ${
                          data ? "cursor-pointer" : ""
                        }`}
                        onClick={() => data && toggleTranscriptItemExpand(itemId)}
                      >
                        {data && (
                          <span
                            className={`text-gray-400 mr-1 transform transition-transform duration-200 select-none font-mono ${
                              expanded ? "rotate-90" : "rotate-0"
                            }`}
                          >
                            ▶
                          </span>
                        )}
                        {title}
                      </div>
                      {expanded && data && (
                        <div className="text-gray-800 text-left">
                          <pre className="border-l-2 ml-1 border-gray-200 whitespace-pre-wrap break-words font-mono text-xs mb-2 mt-2 pl-2">
                            {JSON.stringify(data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                } else {
                  // Fallback if type is neither MESSAGE nor BREADCRUMB
                  return (
                    <div
                      key={itemId}
                      className="flex justify-center text-gray-500 text-sm italic font-mono"
                    >
                      Unknown item type: {type}{" "}
                      <span className="ml-2 text-xs">{timestamp}</span>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      );

};

export default Transcript;