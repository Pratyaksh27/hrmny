'use client';
import { useEffect, useState, useRef } from 'react';
import VoiceCallPanel from './VoiceCallPanel';

interface VoiceSessionManagerProps {
    ephemralKey: string;
}

export default function VoiceSessionManager({ ephemralKey }: VoiceSessionManagerProps) {
    const [sessionStatus, setSessionStatus] = useState<'Connecting' | 'Connected' | 'Disconnected'>('Connecting');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        const connect = async () => {
            try{
                const pc = new RTCPeerConnection();

                // Setup audio Playback
                if (!audioRef.current) {
                    audioRef.current = document.createElement('audio');
                    audioRef.current.autoplay = true;
                    document.body.appendChild(audioRef.current);
                }

                pc.ontrack = (event) => {
                    const stream = event.streams[0];
                    if (audioRef.current) {
                        audioRef.current.srcObject = stream;
                    }
                }

                const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                micStream.getTracks().forEach(track => {
                    pc.addTrack(track, micStream);
                });

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                const response = await fetch(
                    `https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`,
                    {
                        method: 'POST',
                        body: offer.sdp,
                        headers: {
                            Authorization: `Bearer ${ephemralKey}`,
                            'Content-Type': 'application/sdp',
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error(`VoiceManager.tsx: Failed to connect: ${response.statusText}`);
                }
                const answerSdp = await response.text();
                const answer: RTCSessionDescriptionInit = {
                    type: 'answer',
                    sdp: answerSdp,
                };

                await pc.setRemoteDescription(answer);
                setSessionStatus('Connected');
                pcRef.current = pc;

            } catch (error) {
                console.error('Error setting up audio:', error);
                setSessionStatus('Disconnected');
            }
        };
        connect();
        return () => {
            setSessionStatus('Disconnected');
            pcRef.current?.close();
        };
    }, [ephemralKey]);   
    
    return (
        <VoiceCallPanel
            status={sessionStatus}
            onEndCall={() => {
                setSessionStatus('Disconnected');
                pcRef.current?.close();
            }}
        />        
    );
}