'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface VoiceCallPanelProps {
  status: 'Connecting' | 'Connected' | 'Disconnected' | 'Not Started';
  onConnectCall: () => void;
  onEndCall: () => void;
}

export default function VoiceCallPanel({ status, onConnectCall, onEndCall }: VoiceCallPanelProps) {
  const renderStatusContent = () => {
    switch (status) {
      case 'Not Started':
      case 'Connecting':
      case 'Disconnected':
        return (
          <>
            <p className="text-sm text-muted-foreground">
              {status === 'Connecting'
                ? '🔄 Connecting to HR Agent...'
                : status === 'Disconnected'
                ? '❌ Call ended.'
                : '📞 Ready to connect to the HR Agent?'}
            </p>
            <Button className="mt-4" onClick={onConnectCall}>
              📞 Connect Call
            </Button>
            <p className="text-xs text-muted-foreground mt-2 italic">
              You can cancel the call anytime
            </p>
            <p className="text-xs text-muted-foreground italic">
              Please ensure your microphone is working
            </p>
          </>
        );
      case 'Connected':
        return (
          <>
            <p className="text-sm text-green-600 font-medium">
              ✅ You are now talking to the HR Agent.
            </p>
            <Button variant="destructive" className="mt-4" onClick={onEndCall}>
              🛑 End Call
            </Button>
          </>
        );
    }
  };

  return (
    <div className="flex justify-center py-8 px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="py-6">
          <h2 className="text-xl font-semibold mb-4">HR Agent Voice Call</h2>
          {renderStatusContent()}
        </CardContent>
      </Card>
    </div>
  );
}
