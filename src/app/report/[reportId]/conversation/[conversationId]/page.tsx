"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import SidebarCallControls from "@/components/conversation/SideBarCallControls";
import VoiceSessionManager, { VoiceSessionHandle } from "@/components/conversation/VoiceSessionManager";

export default function ConversationPage() {
  const { reportId, conversationId } = useParams<{ reportId: string; conversationId: string }>();
  const [ephemeralKey, setEphemeralKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const managerRef = useRef<VoiceSessionHandle>(null);
  const [status, setStatus] = useState<"Not Started" | "Connecting" | "Connected" | "Disconnected">("Not Started");

  useEffect(() => {
    const fetchEphemeralKey = async () => {
      try {
        const res = await fetch(`/api/session?reportId=${reportId}&conversationId=${conversationId}`);
        if (!res.ok) throw new Error(`Failed to fetch ephemeral key: ${res.statusText}`);
        const data = await res.json();
        const key = data?.client_secret?.value;
        if (!key) throw new Error("No ephemeral key returned from API");
        setEphemeralKey(key);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchEphemeralKey();
  }, [reportId, conversationId]);

  // poll status (simple, cheap) so sidebar text/images update
  useEffect(() => {
    const id = setInterval(() => {
      const s = managerRef.current?.getStatus?.();
      if (s) setStatus(s);
    }, 300);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-textMuted text-lg">Loading voice session...</p>
      </div>
    );
  }
  if (error || !ephemeralKey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">Error: {error ?? "Could not start voice session."}</p>
      </div>
    );
  }

  const onStart = () => managerRef.current?.start?.();
  const onEnd = () => managerRef.current?.end?.();
  const handleFinish = () => {
    // only shown when status === "Disconnected"
    router.push(`/thank-you/${reportId}`);
  };

  return (
    <AppShell
      sidebarContent={
        <SidebarCallControls
          status={status}
          onStart={onStart}
          onEnd={onEnd}
          assets={{
            start: "/mics/conversation_start.png",
            on: "/mics/conversation_on.png",
            end: "/mics/conversation_end.png",
            ended: "/mics/conversation_ended.png",
          }}
        />
      }
      mainContent={
        <div className="p-4">
          {/* Hide the old card controls; only show transcript inside MainContainer */}
          <div className="text-center">
            <h1 className="text-md font-bold text-textMuted">
              Case ID: {reportId}
            </h1>
            <p className="text-md font-bold text-textMuted">
              Conversation ID: {conversationId}
            </p>
          </div>
          <VoiceSessionManager
            ref={managerRef}
            ephemeralKey={ephemeralKey}
            reportId={String(reportId)}
            conversationId={String(conversationId)}
            showPanel={false}
          />
          {status === "Disconnected" && (
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={handleFinish}
                className="inline-flex items-center justify-center rounded-lg px-6 py-3 bg-brand text-buttonText font-semibold hover:opacity-90 transition"
              >
                Finish
              </button>
            </div>
          )}
        </div>
      }
    />
  );
}
