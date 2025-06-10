// This endpoint will create a new report and conversation, and return their IDs.
// For demo purposes, we’ll use in-memory storage. 
// TODO: Replace with DB logic 

// src/app/api/report/start/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { reports, conversations } from '../store';

export async function POST(req: NextRequest) {
  const { employeeId, otherPartyId, witnessId } = await req.json();

  const reportId = (reports.length + 1).toString();
  const conversationId = (conversations.length + 1).toString();

  // Store report with a conversationIds array
  reports.push({
    id: reportId,
    participants: [employeeId, otherPartyId, witnessId].filter(Boolean),
    conversationIds: [conversationId],
    createdAt: new Date(),
  });

  conversations.push({
    id: conversationId,
    reportId,
    participant: employeeId,
    createdAt: new Date(),
    transcript: [],
  });

  return NextResponse.json({ reportId, conversationId });
}


