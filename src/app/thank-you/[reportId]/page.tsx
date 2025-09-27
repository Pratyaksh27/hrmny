import AppShell from '@/components/layout/AppShell';
import ThankYouContent from '@/components/screens/ThankYouContent';

// ✅ Fix: use correct Server Component typing
interface PageProps {
  params: {
    reportId: string;
  };
}

export default function ThankYouPage({ params }: PageProps) {
  const { reportId } = params;

  return (
    <AppShell
      sidebarContent={null}
      mainContent={
        <div className="p-8">
          <ThankYouContent reportId={reportId} />
        </div>
      }
    />
  );
}
