// src/app/thank-you/[reportId]/page.tsx

import AppShell from '@/components/layout/AppShell';
import ThankYouContent from '@/components/screens/ThankYouContent';

export default function ThankYouPage({
  params,
}: {
  params: { reportId: string };
}) {
  const { reportId } = params;

  return (
    <AppShell
      sidebarContent={null} // Sidebar: logo + text only (already handled by Sidebar)
      mainContent={
        <div className="p-8">
          <ThankYouContent reportId={reportId} />
        </div>
      }
    />
  );
}
