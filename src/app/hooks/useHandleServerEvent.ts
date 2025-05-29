"use client";

import { useRef } from "react";
import { ServerEvent } from "@/app/types";
import { useTranscript } from "@/app/contexts/TranscriptContext";

export function useHandleServerEvent() {
    const { transcriptItems, addTranscriptMessage, updateTranscriptMessage, addTranscriptBreadcrumb, toggleTranscriptItemExpand, updateTranscriptItem } = useTranscript();
    
    const handleServerEvent = (serverEvent: ServerEvent) => {   
        switch (serverEvent.type) {
            case "conversation.item.created": {
                let text =
                  serverEvent.item?.content?.[0]?.text ||
                  serverEvent.item?.content?.[0]?.transcript ||
                  "";
                const role = serverEvent.item?.role as "user" | "assistant";
                const itemId = serverEvent.item?.id;
        
                if (itemId && transcriptItems.some((item) => item.itemId === itemId)) {
                  // don't add transcript message if already exists
                  break;
                }
        
                if (itemId && role) {
                  if (role === "user" && !text) {
                    text = "[Transcribing..]";
                  }
                  addTranscriptMessage(itemId, role, text);
                }
                break;
            }

            case "session.created": {
                if (serverEvent.session?.id) {
                  addTranscriptBreadcrumb(
                    `session.id: ${
                      serverEvent.session.id
                    }\nStarted at: ${new Date().toLocaleString()}`
                  );
                }
                break;
            }

            case "conversation.item.input_audio_transcription.completed": {
                const itemId = serverEvent.item_id;
                const finalTranscript =
                  !serverEvent.transcript || serverEvent.transcript === "\n"
                    ? "[inaudible]"
                    : serverEvent.transcript;
                if (itemId) {
                  updateTranscriptMessage(itemId, finalTranscript, false);
                }
                break;
            }
        
            case "response.audio_transcript.delta": {
                const itemId = serverEvent.item_id;
                const deltaText = serverEvent.delta || "";
                if (itemId) {
                    // Update the transcript message with the new text.
                    updateTranscriptMessage(itemId, deltaText, true);
                }
                break;
            }

            case "response.output_item.done": {
                const itemId = serverEvent.item?.id;
                if (itemId) {
                  updateTranscriptItem(itemId, { status: "DONE" });
                }
                break;
            }

            default: 
                break;
        }
    }
    const handleServerEventRef = useRef(handleServerEvent);
    handleServerEventRef.current = handleServerEvent;
    return handleServerEventRef;
}
