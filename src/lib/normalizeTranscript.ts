import { TranscriptItem } from "@/app/types";
import { NormalizedTranscriptItem } from "@/app/types";


/**
 * This Script normalizes the transcript items
 * It ensures that each item has a consistent structure
 * and removes any unnecessary properties.
 * The Structure we are looking for is :
 * [
  { role: "user", content: "..." },
  { role: "assistant", content: "..." },
  ...
    ]

   The normalized transcript is what we will send to an LLM for processing.
   The LLM will then return an array of questions based on the transcript. This would be grouped by the user to who the questions will be asked 
 */

export function normalizeTranscript(transcriptItems: TranscriptItem[]): NormalizedTranscriptItem[] {
    const normalizedTranscript: NormalizedTranscriptItem[] = transcriptItems
        .filter(item => item.type === "MESSAGE" && 
            (item.role === "assistant" ? item.status === "DONE" : item.role === "user")) // Filter out non-message items 
        .map(item => {
            // Normalize each item to the desired structure
            const role = item.role === "user" ? "user" : "assistant"; // Default to assistant if not user
            const content = item.title?.trim() || ""; // Use transcript or text as content
            return {
                role,
                content: content.trim() // Ensure content is trimmed of whitespace
            };
        }).filter(item => item.content !== "" && item.content.toLowerCase() !== "[transcribing..]") as NormalizedTranscriptItem[]; // Remove any items with empty content

    console.log("Normalized Transcript:");
    normalizedTranscript.forEach((msg) => {
        console.log(`Role: ${msg.role}, Content: ${msg.content}`);
    });

    return normalizedTranscript;
}