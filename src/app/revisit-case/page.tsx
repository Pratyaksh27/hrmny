'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RevisitCasePage() {
  const [caseId, setCaseId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/report/add-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: caseId, employeeId: parseInt(employeeId, 10) }),
      });

      if (!res.ok) {
        throw new Error(`Failed to create conversation: ${res.statusText}`);
      }

      const { conversationId } = await res.json();
      router.push(`/report/${caseId}/conversation/${conversationId}`);
    } catch (err) {
      alert('Failed to create conversation. Please check the Case ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Revisit an Existing Case</h2>

            <div className="space-y-2">
              <Label htmlFor="caseId">Case ID</Label>
              <Input
                id="caseId"
                type="text"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeId">Your Employee ID</Label>
              <Input
                id="employeeId"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Starting...' : 'Start Conversation'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
