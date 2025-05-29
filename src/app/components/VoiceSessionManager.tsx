'use client';
import { useState, useRef } from 'react';
import { useHandleServerEvent } from '@/app/hooks/useHandleServerEvent';
import VoiceCallPanel from './VoiceCallPanel';
import Transcript from './Transcript';

interface VoiceSessionManagerProps {
    ephemralKey: string;
}

export default function VoiceSessionManager({ ephemralKey }: VoiceSessionManagerProps) {
    const [sessionStatus, setSessionStatus] = useState<'Not Started'|'Connecting' | 'Connected' | 'Disconnected'>('Not Started');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const dcRef = useRef<RTCDataChannel | null>(null);
    const handleServerEventRef = useHandleServerEvent();
    const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);

    
    const startConnection = async () => {
        setSessionStatus('Connecting');
        try{
            const pc = new RTCPeerConnection();
            // const codec = "opus";

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

            const dc = pc.createDataChannel('oai-events');            
            
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
            dcRef.current = dc;

            dc.addEventListener("message", (e: MessageEvent) => {
                console.log('Received message from data channel:', e.data);
                handleServerEventRef.current(JSON.parse(e.data));
            });
            setDataChannel(dc);


        } catch (error) {
            console.error('Error setting up audio:', error);
            setSessionStatus('Disconnected');
        }
    };

    const endConnection = () => {
        pcRef.current?.close();
        pcRef.current = null;
        setSessionStatus('Disconnected');
        setDataChannel(null);
    }
      
    
    return (
        <>
            <VoiceCallPanel
                status={sessionStatus}
                onConnectCall={startConnection}
                onEndCall={endConnection}
            />
            <Transcript/>

        </>     
    );
}