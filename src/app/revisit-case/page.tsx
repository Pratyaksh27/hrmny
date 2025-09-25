import AppShell from "@/components/layout/AppShell";
import RevisitCaseForm from "@/components/screens/RevisitCaseForm";

export default function RevisitCasePage() {
  return (
    <AppShell
      sidebarContent={null}     // Or a custom sidebar control later
      mainContent={<RevisitCaseForm />}
    />
  );
}
