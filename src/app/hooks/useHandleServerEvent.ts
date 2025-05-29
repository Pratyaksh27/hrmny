"use client";

import { useRef } from "react";
import { ServerEvent } from "@/app/types";
import { useTranscript } from "@/app/contexts/TranscriptContext";

export function useHandleServerEvent() {
    const { transcriptItems, addTranscriptMessage } = useTranscript();
    
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
        }
    }

    const handleServerEventRef = useRef(handleServerEvent);
    handleServerEventRef.current = handleServerEvent;

    return handleServerEventRef;
}
