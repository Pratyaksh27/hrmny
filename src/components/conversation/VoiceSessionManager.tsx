"use client";
import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { useHandleServerEvent } from "@/app/hooks/useHandleServerEvent";
import VoiceCallPanel from "./VoiceCallPanel";
import Transcript from "./Transcript";
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { buildVoiceAgentInstructions, sendNotifications } from "@/lib/utils";
import { useNavigationGuard } from "next-navigation-guard";
import { TranscriptItem } from "@/app/types";
import { generateDerivedQuestionsFromTranscript } from "@/services/generateDerivedQuestions";

export type VoiceSessionHandle = {
  start: () => void;
  end: () => void;
  getStatus: () => "Not Started" | "Connecting" | "Connected" | "Disconnected";
};

interface VoiceSessionManagerProps {
  ephemeralKey: string;
  reportId: string;
  conversationId: string;
  showPanel?: boolean; // default false for the new sidebar-driven UI
}

const VoiceSessionManager = forwardRef<VoiceSessionHandle, VoiceSessionManagerProps>(
  ({ ephemeralKey, reportId, conversationId, showPanel = false }, ref) => {
    const [sessionStatus, setSessionStatus] = useState<"Not Started" | "Connecting" | "Connected" | "Disconnected">("Not Started");
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const dcRef = useRef<RTCDataChannel | null>(null);
    const handleServerEventRef = useHandleServerEvent();
    const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
    const { transcriptItems, clearTranscript } = useTranscript();
    const hasUploadedRef = useRef(false);

    const uploadTranscript = async () => {
      if (hasUploadedRef.current) return;
      hasUploadedRef.current = true;
      try {
        const res = await fetch("/api/conversation/upload-transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, transcript: transcriptItems }),
        });
        if (res.ok) {
          await generateDerivedQuestionsFromTranscript({
            reportId,
            conversationId,
            transcriptItems: transcriptItems as TranscriptItem[],
          });
        } else {
          console.error("❌ Failed to upload transcript:", await res.json());
        }
      } catch (err) {
        console.error("❌ Transcript Upload error:", err);
      }
    };

    useNavigationGuard({
      enabled: sessionStatus === "Connected" || sessionStatus === "Connecting" || sessionStatus === "Disconnected",
      confirm: async () => {
        if (sessionStatus === "Connected") {
          if (window.confirm("Are you sure you want to end the call and navigate away?")) {
            endConnection();
            clearTranscript();
            return true;
          }
          return false;
        }
        clearTranscript();
        return true;
      },
    });

    useEffect(() => {
      if (sessionStatus === "Connected" || sessionStatus === "Connecting") {
        updateSession();
      }
    }, [sessionStatus]);

    const sendClientEvent = (eventObj: unknown) => {
      if (dcRef.current && dcRef.current.readyState === "open") {
        dcRef.current.send(JSON.stringify(eventObj));
      }
    };

    const updateSession = async () => {
      sendClientEvent({ type: "input_audio_buffer.clear" });
      const instructions = await buildVoiceAgentInstructions(reportId, conversationId);

      const turnDetection = {
        type: "server_vad",
        threshold: 0.65,
        prefix_padding_ms: 300,
        silence_duration_ms: 2500,
        create_response: true,
      };

      const sessionUpdateEvent = {
        type: "session.update",
        session: {
          modalities: ["text", "audio"],
          instructions,
          voice: "sage",
          speed: 1.3,
          input_audio_transcription: { model: "whisper-1" },
          input_audio_noise_reduction: { type: "near_field" },
          turn_detection: turnDetection,
        },
      };
      sendClientEvent(sessionUpdateEvent);
    };

    const startConnection = async () => {
      setSessionStatus("Connecting");
      try {
        const pc = new RTCPeerConnection();

        if (!audioRef.current) {
          audioRef.current = document.createElement("audio");
          audioRef.current.autoplay = true;
          document.body.appendChild(audioRef.current);
        }

        pc.ontrack = (event) => {
          const stream = event.streams[0];
          if (audioRef.current) audioRef.current.srcObject = stream;
        };

        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000,
            channelCount: 1,
          },
        });
        micStream.getTracks().forEach((t) => pc.addTrack(t, micStream));

        const dc = pc.createDataChannel("oai-events");
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const response = await fetch(
          `https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2025-06-03`,
          {
            method: "POST",
            body: offer.sdp,
            headers: {
              Authorization: `Bearer ${ephemeralKey}`,
              "Content-Type": "application/sdp",
            },
          }
        );
        if (!response.ok) throw new Error(`VoiceManager.tsx: Failed to connect: ${response.statusText}`);

        const answerSdp = await response.text();
        await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

        pcRef.current = pc;
        dcRef.current = dc;
        setSessionStatus("Connected");

        dc.addEventListener("message", (e: MessageEvent) => {
          handleServerEventRef.current(JSON.parse(e.data));
        });

        dc.addEventListener("open", () => {
          updateSession();
        });

        setDataChannel(dc);
      } catch (error) {
        console.error("Error setting up audio:", error);
        setSessionStatus("Disconnected");
      }
    };

    const endConnection = async () => {
      pcRef.current?.close();
      pcRef.current = null;
      setSessionStatus("Disconnected");
      setDataChannel(null);
      await uploadTranscript();
      await sendNotifications(reportId, conversationId);
    };

    // expose controls upward
    useImperativeHandle(ref, () => ({
      start: startConnection,
      end: endConnection,
      getStatus: () => sessionStatus,
    }));

    return (
      <div className="flex flex-col space-y-0">
        {showPanel && (
          <VoiceCallPanel
            status={sessionStatus}
            onConnectCall={startConnection}
            onEndCall={endConnection}
          />
        )}
        <Transcript />
      </div>
    );
  }
);

VoiceSessionManager.displayName = "VoiceSessionManager";

export default VoiceSessionManager;
