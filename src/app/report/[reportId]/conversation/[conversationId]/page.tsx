'use client';

import React, { useState, useEffect } from 'react';
import VoiceSessionManager from '@/app/components/VoiceSessionManager';
import { useParams } from 'next/navigation';

export default function ConversationPage() {
  const { reportId, conversationId } = useParams<{
    reportId: string;
    conversationId: string;
  }>();

  const [ephemeralKey, setEphemeralKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEphemeralKey = async () => {
      try {
        const res = await fetch(
          `/api/session?reportId=${reportId}&conversationId=${conversationId}`
        );
        if (!res.ok) {
          throw new Error(`Failed to fetch ephemeral key: ${res.statusText}`);
        }

        const data = await res.json();
        const key = data?.client_secret?.value;
        if (!key) {
          throw new Error('No ephemeral key returned from API');
        }

        setEphemeralKey(key);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchEphemeralKey();
  }, [reportId, conversationId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading voice session...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">Error: {error}</p>
      </div>
    );

  if (!ephemeralKey)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Could not start voice session.</p>
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto mt-2 space-y-0">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Conversation for Report <span className="text-blue-600">{reportId}</span>
          </h1>
          <p className="text-sm text-gray-500">
            Conversation ID: {conversationId}
          </p>
        </div>
        <VoiceSessionManager ephemeralKey={ephemeralKey} reportId={reportId} conversationId={conversationId} />
      </div>
    </main>
  );
}
