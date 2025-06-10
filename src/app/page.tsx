'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      <h1>Welcome to HR Voice Agent</h1>
      <button
        style={{ margin: '10px', padding: '10px 20px', fontSize: '16px' }}
        onClick={() => router.push('/start-new-case')}
      >
        Start New Case
      </button>
      <button
        style={{ margin: '10px', padding: '10px 20px', fontSize: '16px' }}
        onClick={() => router.push('/revisit-case')}
      >
        Revisit Existing Case
      </button>
    </div>
  );
}
