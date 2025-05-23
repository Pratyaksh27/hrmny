'use client';
import { useState, useRef } from 'react';
import VoiceCallPanel from './VoiceCallPanel';

interface VoiceSessionManagerProps {
    ephemralKey: string;
}

export default function VoiceSessionManager({ ephemralKey }: VoiceSessionManagerProps) {
    const [sessionStatus, setSessionStatus] = useState<'Not Started'|'Connecting' | 'Connected' | 'Disconnected'>('Not Started');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);

    
    const startConnection = async () => {
        setSessionStatus('Connecting');
        try{
            const pc = new RTCPeerConnection();
            pcRef.current = pc;

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

            const dataChannel = pc.createDataChannel('oai-events');

            dataChannel.addEventListener('open', () => {
                console.log('✅ DataChannel opened');
              });
        
              dataChannel.addEventListener('close', () => {
                console.log('❌ DataChannel closed');
            });
            
            setSessionStatus('Connected');
            pcRef.current = pc;

        } catch (error) {
            console.error('Error setting up audio:', error);
            setSessionStatus('Disconnected');
        }
    };

    const endConnection = () => {
        pcRef.current?.close();
        pcRef.current = null;
        setSessionStatus('Disconnected');
    }
      
    
    return (
        <>
            <VoiceCallPanel
                status={sessionStatus}
                onConnectCall={startConnection}
                onEndCall={endConnection}
            />
        </>     
    );
}