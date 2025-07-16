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
    /**
     * What comes out of the LLM is a JSON formatted string that represents an array of {employeeId, role, questions[]}
     * So we need JSON.parse to convert that JSON fromatted string into a JavaScript object.
     * If the LLM output is not a string, we log an error and return a 500 response.
     * If the parsing fails, we log the error and return a 500 response.
     */
    let parsedContent;
    try {
      if (typeof content === "string") {
        parsedContent = JSON.parse(content);
      } else {
        console.error("❌ derived-questions/generate/route: LLM output is not a string:", content);
      }
    } catch (error) {
      console.error("❌ derived-questions/generate/route: Error parsing LLM output:", error);
      return NextResponse.json({ error: "derived-questions/generate/route: Failed to parse LLM output" }, { status: 500 });
    }

    return NextResponse.json({ questions: parsedContent }, { status: 200 });
  } catch (error) {
    console.error("❌ derived-questions/generate/route: Error generating questions:", error);
    return NextResponse.json({ error: "derived-questions/generate/route: Failed to generate questions" }, { status: 500 });
  }
}

