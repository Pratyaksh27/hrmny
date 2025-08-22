'use client';
import { useState, useRef, useEffect } from 'react';
import { useHandleServerEvent } from '@/app/hooks/useHandleServerEvent';
import VoiceCallPanel from './VoiceCallPanel';
import Transcript from './Transcript';
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { buildVoiceAgentInstructions } from "@/lib/utils";
import { useNavigationGuard } from "next-navigation-guard";
import { TranscriptItem } from "@/app/types";
import { generateDerivedQuestionsFromTranscript } from "@/services/generateDerivedQuestions";

interface VoiceSessionManagerProps {
    ephemeralKey: string;
    reportId: string;
    conversationId: string;
}

export default function VoiceSessionManager({ ephemeralKey, reportId,  conversationId }: VoiceSessionManagerProps) {
    const [sessionStatus, setSessionStatus] = useState<'Not Started'|'Connecting' | 'Connected' | 'Disconnected'>('Not Started');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const dcRef = useRef<RTCDataChannel | null>(null);
    const handleServerEventRef = useHandleServerEvent();
    const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
    const { transcriptItems, clearTranscript } = useTranscript();
    const hasUploadedRef = useRef(false); // To track if the transcript has been uploaded


    const uploadTranscript = async () => {
        if (hasUploadedRef.current) return;
        hasUploadedRef.current = true;

        try {
            const res = await fetch("/api/conversation/upload-transcript", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationId,
                    transcript: transcriptItems,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                console.error("❌ Failed to upload transcript:", err);
            } else {
                console.log("✅ Transcript uploaded successfully");
                // Generate derived questions from the transcript
                await generateDerivedQuestionsFromTranscript({
                    reportId,
                    conversationId,
                    transcriptItems: transcriptItems as TranscriptItem[],
                });
            }
        } catch (err) {
            console.error("❌ Transcript Upload error:", err);
        }
    };

    /**
     * When the user navigates away from the page, the session should end
     * This is the navigationGuard for that
     */
    useNavigationGuard({
       enabled: sessionStatus === "Connected" || sessionStatus === "Connecting" || sessionStatus === "Disconnected",
       confirm: async () => {
            if (sessionStatus === "Connected") {
                // If connected, we want to end the call before navigating away
                if (window.confirm("Are you sure you want to end the call and navigate away?")) {
                    endConnection();
                    clearTranscript(); // Clear the transcript when ending the call
                    return true;
                }
                else {
                    // If the user cancels, we do not want to navigate away
                    return false;
                }
            }
            // Allow navigation
            clearTranscript(); // Clear the transcript when navigating away
            return true;
        }
    });


    /*
    ** The Below useEffect is used to update the session when the sessionStatus changes.
    ** In the Update Session we send a session.update event to the server with the new modalities and voice settings.
    ** This is necessary to ensure that we get transcription of the user audio
     */
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

    const updateSession = async () => {
        console.log("UPDATE SESSION: Updating session with new modalities and voice settings");
        sendClientEvent(
            { type: "input_audio_buffer.clear" },
            "clear audio buffer on session update"
        );
    
        // const instructions = employeeDisputeHRAgent.instructions || "";
        const instructions = await buildVoiceAgentInstructions(reportId, conversationId);

        const turnDetection = {
            type: "server_vad",
            threshold: 0.75,
            prefix_padding_ms: 300,
            silence_duration_ms: 2500,
            create_response: true,
        }

        // Session Update event is somehow necessary to get the user's audio to be transcribed
        // whisper-1 is the model used for audio transcription
        // The input_audio_noise_reduction is set to near_field (assuming the user is using a headset or microphone close to their mouth)
        // If the user is using a speaker or is in a conference room, we can set it to far_field
        // TODO: Add a setting to allow the user to choose between near_field and far_field
        const sessionUpdateEvent = {
            type: "session.update",
            session: {
                modalities: ["text","audio"],
                instructions: instructions,
                voice: "sage",
                input_audio_transcription: [{ 
                    model: "whisper-1",
                    language: "en",
                 }],
                input_audio_noise_reduction : {
                    type: "near_field",
                },
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

            // Below we are using WebRTC's getUserMedia (implemented by) to get the microphone stream
            // and add it to the peer connection.
            // This is necessary to send the user's audio to the server for transcription.
            // We are also setting the audio constraints to ensure that the audio is of good quality.
            // We are using echoCancellation, noiseSuppression, and autoGainControl to improve the audio quality.
            // The sampleRate is set to 16000 and channelCount to 1
            // to ensure that the audio is in a format that the server can process.
            const micStream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000,
                    channelCount: 1,
                }, 
            });
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

    const endConnection = async () => {
        pcRef.current?.close();
        pcRef.current = null;
        setSessionStatus('Disconnected');
        setDataChannel(null);
        await uploadTranscript(); // Upload the transcript when ending the session
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


/**
 * Noise Reduction Settings:
 * - near_field: For close microphone use (e.g., headset)
 * - far_field: For distant microphone use (e.g., speaker)
 * - threshold: Adjusts sensitivity for voice activity detection. Higher values reduce false positives but may miss some speech.
 * - echoCancellation: Reduces echo in audio input.
 * - noiseSuppression: Reduces background noise in audio input. (keyboard, fan, AC noise etc.  )
 * - autoGainControl: Automatically adjusts mic sensitivity. If someone speaks too softly, it will boost the volume.
 * - sampleRate: Set to 16000 for better compatibility with Whisper.
 * - channelCount: Set to 1 for mono audio, which is sufficient for voice.

 */