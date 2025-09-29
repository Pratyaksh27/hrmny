import AppShell from "@/components/layout/AppShell";
import WelcomeContent from "@/components/screens/WelcomeContent";
import HamburgerMenu from "@/components/ui/HamburgerMenu";

export default function HomePage() {
  return (
    <AppShell
        sidebarContent={<HamburgerMenu />}
        mainContent={<WelcomeContent />}
    />
  );
}
