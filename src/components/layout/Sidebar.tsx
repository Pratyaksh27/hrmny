// src/components/layout/Sidebar.tsx
import Image from "next/image";

export default function Sidebar({ children }: { children?: React.ReactNode }) {
  return (
    <aside className="w-[240px] bg-sidebar text-brand p-4 flex flex-col">
      {/* Logo and Title */}
      <div className="flex justify-center gap-2 mb-6">
        <Image src="/vercel.svg" alt="Logo" width={24} height={24} />
        <span className="text-lg font-semibold">HRMNY HR</span>
      </div>

      {/* Slot for optional content like hamburger */}
      <div className="flex-1 flex justify-center">
        {children}
      </div>
    </aside>
  );
}
