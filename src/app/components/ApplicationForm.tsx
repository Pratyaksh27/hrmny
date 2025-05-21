'use client';

import React, { useState } from 'react';
import '../App.css';
import VoiceSessionManager from './VoiceSessionManager';



function ApplicationForm() {
  const [employeeId, setEmployeeId] = useState('');
  const [otherPartyId, setOtherPartyId] = useState('');
  const [witnessId, setWitnessId] = useState('');
  const [ephemeralKey, setEphemeralKey] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/session', {
        method: 'GET',
      });

      if (!res.ok) {
        throw new Error(`Failed to create Voice HR session: ${res.statusText}`);
      }
      const sessionData = await res.json();
      const key = sessionData?.client_secret?.value;
      if (!key) {
        throw new Error('ApplicationForm.tsx: Failed to retrieve ephemeral key');
      }
      setEphemeralKey(key);
      console.log('Voice session started:', sessionData);

    } catch (error) {
      console.error('Error submitting form and starting Voice session:', error);
    }

  };

  if (ephemeralKey) {
    return (
      <div>
        <VoiceSessionManager ephemralKey={ephemeralKey} />
        <p>Voice session started successfully!</p>
      </div>
    );
  }

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

      <button type="submit">Talk to HR</button>
    </form>
  );
}

export default ApplicationForm;
