// src/components/screens/ThankYouContent.tsx
'use client';

import React from 'react';

type ThankYouContentProps = {
  reportId: string;
};

export default function ThankYouContent({ reportId }: ThankYouContentProps) {
  return (
    <div className="max-w-2xl mx-auto py-10">
      <header className="mb-6">
        <h1 className="text-lg font-semibold tracking-tight text-center">Thank you for using HRMNY</h1>
      </header>

      <p className="text-muted-foreground leading-7">
        Your report is now securely documented and will be reviewed with care. A copy of the transcript will be
        shared with you and you’ll be guided on the next steps, shortly. Your case number is below. Should you have
        any questions, let us know and we’ll be happy to answer them.
      </p>

      <div className="mt-6 rounded-2xl border p-4">
        <div className="text-sm text-muted-foreground">Your Case Number</div>
        <div className="text-xl font-medium mt-1">{reportId}</div>
      </div>
    </div>
  );
}
