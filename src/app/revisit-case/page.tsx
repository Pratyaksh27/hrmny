'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RevisitCasePage() {
  const [caseId, setCaseId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call the API to create a new conversation for the given report
      const res = await fetch('/api/report/add-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: caseId, employeeId }),
      });

      if (!res.ok) {
        throw new Error(`Failed to create conversation: ${res.statusText}`);
      }
      const { conversationId } = await res.json();

      // Redirect to the conversation page
      router.push(`/report/${caseId}/conversation/${conversationId}`);
    } catch (err) {
      alert('Failed to create conversation. Please check the Case ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      <h2>Revisit an Existing Case</h2>
      <label>
        Enter Case ID:
        <input
          type="text"
          value={caseId}
          onChange={(e) => setCaseId(e.target.value)}
          required
        />
      </label>
      <label>
        Enter Your Employee ID:
        <input
          type="text"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          required
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Starting...' : 'Start Conversation'}
      </button>
    </form>
  );
}
