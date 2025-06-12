'use client';
import { useState, useRef, useEffect } from 'react';
import { useHandleServerEvent } from '@/app/hooks/useHandleServerEvent';
import VoiceCallPanel from './VoiceCallPanel';
import Transcript from './Transcript';
import { AgentConfig } from "@/app/types";
import employeeDisputeHRAgent from "@/app/agentConfigs/disputeResolutionAgent";

interface VoiceSessionManagerProps {
    ephemeralKey: string;
}

export default function VoiceSessionManager({ ephemeralKey }: VoiceSessionManagerProps) {
    const [sessionStatus, setSessionStatus] = useState<'Not Started'|'Connecting' | 'Connected' | 'Disconnected'>('Not Started');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const dcRef = useRef<RTCDataChannel | null>(null);
    const handleServerEventRef = useHandleServerEvent();
    const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);

    
    useEffect(() => {
        if (sessionStatus === 'Connected' || sessionStatus === 'Connecting') {
            updateSession();
        } 
    }, [sessionStatus]);

    const sendClientEvent = (eventObj: unknown, eventNameSuffix = "") => {
        console.log("INSIDE SENDCLIENTEVENT")
        if (dcRef.current && dcRef.current.readyState === 'open') {
            console.log(`Sending event inside send client event:`, JSON.stringify(eventObj));
            dcRef.current.send(JSON.stringify(eventObj));
        }
    };

    const updateSession = () => {
        console.log("UPDATE SESSION: Updating session with new modalities and voice settings");
        sendClientEvent(
            { type: "input_audio_buffer.clear" },
            "clear audio buffer on session update"
        );
    
        const instructions = employeeDisputeHRAgent.instructions || "";

        const turnDetection = {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 200,
            create_response: true,
        }

        const sessionUpdateEvent = {
            type: "session.update",
            session: {
                modalities: ["text","audio"],
                instructions: instructions,
                voice: "sage",
                input_audio_transcription: { model: "whisper-1" },
                turn_detection: turnDetection,
            },
        }
        sendClientEvent(sessionUpdateEvent);
    }

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
                `https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2025-06-03`,
                {
                    method: 'POST',
                    body: offer.sdp,
                    headers: {
                        Authorization: `Bearer ${ephemeralKey}`,
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
            
            // setSessionStatus('Connected');
            pcRef.current = pc;
            dcRef.current = dc;
            setSessionStatus('Connected');

            dc.addEventListener("message", (e: MessageEvent) => {
                console.log('Received message from data channel:', e.data);
                handleServerEventRef.current(JSON.parse(e.data));
            });

            dc.addEventListener("open", () => {
                console.log("Data channel is open — sending session.update");
                updateSession(); // NOW it is safe to call this
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
        <div className="flex flex-col space-y-0">
            <VoiceCallPanel
            status={sessionStatus}
            onConnectCall={startConnection}
            onEndCall={endConnection}
            />
            <Transcript />
        </div>
    );
}