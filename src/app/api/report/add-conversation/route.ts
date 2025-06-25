import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';


export async function POST(req: NextRequest) {
  const { reportId, employeeId } = await req.json();
  const conversationId = uuidv4();

  if (!reportId || !employeeId) {
      return NextResponse.json({ error: 'Missing reportId or employeeId' }, { status: 400 });
  }

  // Verify that the report exists
  // The reportId should match a row in the 'reports' table
  try {
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .select('id')
      .eq('id', reportId)
      .single();

    if (reportError || !reportData) {
      console.error('Error fetching report:', reportError);
      return NextResponse.json(
        { error: 'Report not found' + (reportError ? `: ${reportError.message}` : '') },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Unexpected error fetching report:', error);
    return NextResponse.json(
      { error: 'Unexpected error fetching report' },
      { status: 500 }
    );
  }

  /*
  ** Create a New Conversation in the conversations table.
  ** This will include the conversation ID, report ID, employee ID as the participant,
  ** the created_at field set to the current date and time, and an empty transcript array
  */

  try {
    const { error: conversationError } = await supabase
      .from('conversations')
      .insert([{
        id: conversationId,
        report_id: reportId,
        participant: employeeId,
        created_at: new Date().toISOString(),
        transcript: [],
      }]);

    if (conversationError) {
      console.error('Error creating conversation:', conversationError);
      return NextResponse.json(
        { error: 'Failed to create conversation' + `: ${conversationError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error creating conversation:', error);
    return NextResponse.json(
      { error: 'Unexpected error creating conversation' },
      { status: 500 }
    );
  }

  return NextResponse.json({ conversationId });
}
