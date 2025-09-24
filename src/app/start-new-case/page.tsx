'use client';

import AppShell from "@/components/layout/AppShell";
import ApplicationForm from "@/components/screens/ApplicationForm";

export default function StartNewCasePage() {
  return (
    <AppShell
      sidebarContent={null}
      mainContent={<ApplicationForm />}
    />
  );
}

