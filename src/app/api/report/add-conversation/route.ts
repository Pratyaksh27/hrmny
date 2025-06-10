import { NextRequest, NextResponse } from 'next/server';
import { reports, conversations } from '../store';

export async function POST(req: NextRequest) {
  const { reportId, employeeId } = await req.json();

  const report = reports.find(r => r.id === reportId);
  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  const conversationId = (conversations.length + 1).toString();

  conversations.push({
    id: conversationId,
    reportId,
    participant: employeeId,
    createdAt: new Date(),
    transcript: [],
  });

  report.conversationIds.push(conversationId);

  return NextResponse.json({ conversationId });
}
