// src/app/api/derived-questions/generate/route.ts

import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/server/openai";
import { questionGenerationInstructions } from "@/app/agentConfigs/questionGenerationInstructions";
import { TargetParticipant, NormalizedTranscriptItem } from "@/app/types";

export async function POST(req: NextRequest) {
  try {
    const { targetParticipants, normalizedTranscript }: {
      targetParticipants: TargetParticipant[];
      normalizedTranscript: NormalizedTranscriptItem[];
    } = await req.json();

    if (!Array.isArray(targetParticipants) || !Array.isArray(normalizedTranscript)) {
      return NextResponse.json({ error: "Invalid input format" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: questionGenerationInstructions,
        },
        {
          role: "user",
          content: JSON.stringify(
            {
              transcript: normalizedTranscript,
              targetParticipants: targetParticipants.map((p) => ({
                employeeId: p.employeeId,
                role: p.role,
                firstName: p.firstName,
                lastName: p.lastName,
              })),
            },
            null,
            2
          ),
        },
      ],
    });

    const content = completion.choices[0].message.content;
    console.log("🧠 LLM Output:", content);

    return NextResponse.json({ questions: content });
  } catch (error) {
    console.error("❌ Error generating questions:", error);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}

