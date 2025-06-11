'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function RootPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 p-8 bg-white rounded-xl shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Welcome to HR Voice Agent
        </h1>
        <div className="flex flex-col gap-4">
          <Button onClick={() => router.push('/start-new-case')}>
            Start New Case
          </Button>
          <Button variant="outline" onClick={() => router.push('/revisit-case')}>
            Revisit Existing Case
          </Button>
        </div>
      </div>
    </div>
  );
}
