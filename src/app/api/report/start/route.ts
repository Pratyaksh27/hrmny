// This endpoint will create a new report and conversation, and return their IDs.
// For demo purposes, we’ll use in-memory storage. 
// TODO: Replace with DB logic 

// src/app/api/report/start/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const { employeeId, otherPartyId, witnessId } = await req.json();
  const reportId = uuidv4();
  const conversationId = uuidv4();
  const participants = [employeeId, otherPartyId, witnessId].filter(Boolean);

  /*
  ** Create a New Report in the reports table. Using the reportId and conversationID generated above.
  ** This will include the report ID, participants, and conversation IDs.
  ** The conversation IDs will be an array containing the newly created conversation ID.
  ** The created_at field will be set to the current date and time.
   */
  try {
    const { error: reportError } = await supabase
      .from('reports').insert([{
        id: reportId,
        participants: participants,
        created_at: new Date().toISOString(),
      }]);
    
    if (reportError) {
      console.error('Error creating report:', reportError);
      return NextResponse.json(
        { error: 'Failed to create report' + `: ${reportError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error creating report:', error);
    return NextResponse.json(
      { error: 'Unexpected error creating report' },
      { status: 500 }
    );
  }

  /*
  ** Create a New Conversation in the conversations table.
  ** This will include the conversation ID, report ID, employee ID as the participant,
  ** the created_at field set to the current date and time, and an empty transcript array.
  ** The conversation ID will be the one generated above.
  ** The report ID will be the one created above.
  ** The employee ID will be the one passed in the request body.
  */
  try {
    const { error: conversationError } = await supabase
      .from('conversations').insert([{
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

  return NextResponse.json({ reportId, conversationId });
}


