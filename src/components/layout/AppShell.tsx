// src/components/layout/AppShell.tsx
import Sidebar from "./Sidebar";
import MainContainer from "./MainContainer";

export default function AppShell({
  sidebarContent,
  mainContent,
}: {
  sidebarContent?: React.ReactNode;
  mainContent?: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar>{sidebarContent}</Sidebar>
      <MainContainer>{mainContent}</MainContainer>
    </div>
  );
}
