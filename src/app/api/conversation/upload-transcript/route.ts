// src/app/api/conversation/upload-transcript/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { TranscriptItem } from "@/app/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { conversationId, transcript } = body as {
      conversationId: string;
      transcript: TranscriptItem[];
    };

    if (!conversationId || !Array.isArray(transcript)) {
      return NextResponse.json(
        { error: "Missing or invalid parameters" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("conversations")
      .update({ transcript })
      .eq("id", conversationId);

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { error: "Failed to update transcript" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error in upload-transcript route:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
