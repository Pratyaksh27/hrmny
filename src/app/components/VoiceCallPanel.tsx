'use client';
import React from 'react';

interface VoiceCallPanelProps {
    status: 'Connecting' | 'Connected' | 'Disconnected';
    onEndCall: () => void;
}

export default function VoiceCallPanel({ status, onEndCall }: VoiceCallPanelProps) {
    return (
        <div className="voice-call-panel">
            <h2>HR Agent Voice Call</h2>

            {status === 'Connecting' && <p>🔄 Connecting to HR Agent...</p>}
            {status === 'Connected' && <p>✅ You are now talking to the HR Agent.</p>}
            {status === 'Disconnected' && <p>❌ Call ended.</p>}

            <button onClick={onEndCall} className="end-call-button">
                🛑 End Call
            </button>
            <div className="transcript-placeholder">
                <p><em>(Live transcript will appear here…)</em></p>
            </div>
            
            <style jsx>{`
                .voice-call-panel {
                border: 1px solid #ccc;
                padding: 1.5rem;
                border-radius: 12px;
                max-width: 500px;
                margin: 2rem auto;
                text-align: center;
                background: #f9f9f9;
                }
                .end-call-button {
                margin-top: 1rem;
                background-color: red;
                color: white;
                padding: 0.75rem 1.25rem;
                font-size: 1rem;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                }
                .transcript-placeholder {
                margin-top: 2rem;
                font-size: 0.9rem;
                color: gray;
                }
         `}</style>

        </div>
    );
}
   