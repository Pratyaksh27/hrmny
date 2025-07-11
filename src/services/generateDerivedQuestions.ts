import { getTargetParticipants } from "./getTargetParticipants";
import { TranscriptItem } from "@/app/types";
import { normalizeTranscript } from "@/lib/normalizeTranscript";


export async function generateDerivedQuestionsFromTranscript({
    conversationId,
    transcriptItems,
}: {
    conversationId: string;
    transcriptItems: TranscriptItem[];
}) {
    // Get the target participants for the conversation
    const targetParticipants = await getTargetParticipants(conversationId);

    // If no target participants, return an empty array
    if (targetParticipants.length === 0) {
        return [];
    }

    // For now, Just print out the target participants. This Will be removed
    targetParticipants.forEach((participant) => {
        console.log(`generateDerivedQuestions.ts: Target Participant: ${participant.employeeId}, First NAme: ${participant.firstName} , Last NAme: ${participant.lastName}, Role: ${participant.role || "unknown"}`);
    });

    // questions = call LLM (transcriptItems, targetParticipants)
    // For each question, Enter into the derived_questions table

    const normalizedTranscript = normalizeTranscript(transcriptItems);
    console.log("generateDerivedQuestions.ts: Normalized Transcript for Derived Questions:");
    normalizedTranscript.forEach((msg) => {
        console.log(`Role: ${msg.role}, Content: ${msg.content}`);
    });

    // Step 3: Send to LLM via API route
  try {
    const response = await fetch("/api/derived-questions/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetParticipants,
        normalizedTranscript,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err?.error || "generateDerivedQuestions.ts: Unknown error from LLM route");
    }

    const data = await response.json();
    console.log("✅ generateDerivedQuestions.ts: Derived Questions:", data.questions);

    // Step 4: TODO — Parse `data.questions` and insert into DB
    // (You'll handle this in the next step.)

  } catch (err) {
    console.error("❌ generateDerivedQuestions.ts: Failed to generate derived questions:", err);
  }

}