import { ReactNode } from "react";

export default function MainContainer({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 bg-bgCanvas p-8 text-textPrimary overflow-y-auto">
      {children}
    </main>
  );
}
