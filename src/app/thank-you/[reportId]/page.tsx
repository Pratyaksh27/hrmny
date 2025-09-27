// src/app/thank-you/[reportId]/page.tsx
"use client";

import React from 'react';
import { useParams } from "next/navigation";
import AppShell from '@/components/layout/AppShell';
import Sidebar from '@/components/layout/Sidebar';
import MainContainer from '@/components/layout/MainContainer';
import ThankYouContent from '@/components/screens/ThankYouContent';

export default function ThankYouPage() {
  const { reportId } = useParams<{ reportId: string} >();

  return (
    <AppShell
      sidebarContent={null}
      mainContent={
        <MainContainer>
          <ThankYouContent reportId={reportId} />
        </MainContainer>
      }
    />
  );
}
