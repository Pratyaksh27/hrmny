"use client";
import React, { useState, useEffect } from 'react';
import VoiceSessionManager from '@/app/components/VoiceSessionManager';
import { useParams } from 'next/navigation';


export default function ConversationPage() {
    const { reportId, conversationId } = useParams<{ reportId: string; conversationId: string }>();
    const [ephemeralKey, setEphemeralKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch the ephemeral key for this conversation
        const fetchEphemeralKey = async () => {
          try {
            // Adjust the API path as needed for your backend
            const res = await fetch(`/api/session?reportId=${reportId}&conversationId=${conversationId}`);
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
    if (loading) return <div>Loading voice session...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!ephemeralKey) return <div>Could not start voice session.</div>;

    return (
        <div className="conversation-page">
            <h1>Conversation for Report {reportId}</h1>
            <h2>Conversation ID: {conversationId}</h2>
            <VoiceSessionManager
                ephemeralKey={ephemeralKey}
            />
        </div>
    );
}