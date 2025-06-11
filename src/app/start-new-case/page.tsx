'use client';

import ApplicationForm from '../components/ApplicationForm';

export default function StartNewCasePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-xl bg-white shadow-md rounded-xl p-6 space-y-4">
        <ApplicationForm />
      </div>
    </div>
  );
}
