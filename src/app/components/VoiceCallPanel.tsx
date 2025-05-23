'use client';
import React from 'react';

interface VoiceCallPanelProps {
    status: 'Connecting' | 'Connected' | 'Disconnected' | 'Not Started';
    onConnectCall: () => void;
    onEndCall: () => void;
}

export default function VoiceCallPanel({ status, onConnectCall ,onEndCall }: VoiceCallPanelProps) {
    return (
        <div className="voice-call-panel">
            <h2>HR Agent Voice Call</h2>

            {status === 'Not Started' && (
                <>
                    <p>📞 Ready to connect to the HR Agent ?</p>
                    <button onClick={onConnectCall} className="end-call-button">
                        📞 Connect Call
                    </button>
                    <p><em>(You can cancel the call anytime)</em></p>
                    <p><em>(Please ensure your microphone is working)</em></p>
                </>
            )}
            

            {status === 'Connecting' && (
                <>
                    <p>🔄 Connecting to HR Agent...</p>
                    <button onClick={onConnectCall} className="end-call-button">
                        📞 Connect Call
                    </button>
                    <p><em>(You can cancel the call anytime)</em></p>
                    <p><em>(Please ensure your microphone is working)</em></p>
                </>
            )}
            {status === 'Connected' && (
                <>
                    <p>✅ You are now talking to the HR Agent.</p>
                    <button onClick={onEndCall} className="end-call-button">
                        🛑 End Call
                    </button>
                </>
            )}
            {status === 'Disconnected' && (
                <>
                    <p>❌ Call ended.</p>
                    <button onClick={onConnectCall} className="end-call-button">
                        📞 Connect Call
                    </button>
                    <p><em>(You can cancel the call anytime)</em></p>
                    <p><em>(Please ensure your microphone is working)</em></p>
                </>
            )}

            
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
   