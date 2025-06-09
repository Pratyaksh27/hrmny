'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../App.css';
import VoiceSessionManager from './VoiceSessionManager';



function ApplicationForm() {
  const [employeeId, setEmployeeId] = useState('');
  const [otherPartyId, setOtherPartyId] = useState('');
  const [witnessId, setWitnessId] = useState('');
  // const [ephemeralKey, setEphemeralKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/report/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, otherPartyId, witnessId }),
      });

      if (!res.ok) {
        throw new Error(`Failed to start Report: ${res.statusText}`);
      }
      const { reportId, conversationId } = await res.json();
      // Redirect to the conversation page
      router.push(`/report/${reportId}/conversation/${conversationId}`);

    } catch (error) {
      console.error('Error submitting form and starting the report:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <label>
        Your Employee ID<span className="required">*</span>:
        <input
          type="text"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          required
        />
      </label>

      <label>
        Other Party's Employee ID<span className="required">*</span>:
        <input
          type="text"
          value={otherPartyId}
          onChange={(e) => setOtherPartyId(e.target.value)}
          required
        />
      </label>

      <label>
        Witness' Employee ID (Optional):
        <input
          type="text"
          value={witnessId}
          onChange={(e) => setWitnessId(e.target.value)}
        />
      </label>

      <button type="submit">Start New Case</button>
    </form>
  );
}

export default ApplicationForm;
