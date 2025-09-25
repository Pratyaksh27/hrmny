'use client';

export default function ThankYouContent({ reportId }: { reportId: string }) {
  return (
    <section className="bg-bgCanvas text-textPrimary p-8 rounded-lg max-w-2xl mx-auto">
      <h1 className="text-lg font-bold mb-4 text-center">Thank you for using HRMNY</h1>

      <p className="text-base mb-4">
        Your report is now securely documented and will be reviewed with care.
      </p>

      <p className="text-base mb-4">
        A copy of the transcript will be shared with you and you’ll be guided on the next steps, shortly.
        Your case number is below.
      </p>

      <p className="text-base mb-8">
        Should you have any questions, let us know and we’ll be happy to answer them.
      </p>

      <div className="text-base">
        <span className="font-bold">Your Case Number is:</span>{' '}
        <span className="font-semibold">{reportId}</span>
      </div>
    </section>
  );
}