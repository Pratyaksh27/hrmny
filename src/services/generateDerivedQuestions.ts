import { supabase } from "@/lib/supabase";
import { getTargetParticipants } from "./getTargetParticipants";
import { ParticipantRole, TranscriptItem } from "@/app/types";
import { normalizeTranscript } from "@/lib/normalizeTranscript";


export async function generateDerivedQuestionsFromTranscript({
    reportId,
    conversationId,
    transcriptItems,
}: {
    reportId: string;
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

    // Check whether `data.questions` is an array or NOT. We expect an array of questions
    if (!Array.isArray(data.questions)) {
      console.error("❌ generateDerivedQuestions.ts: 'questions' is not an array:", data.questions);
      throw new Error("Invalid response format: 'questions' is not an array");
    }


    await saveDerivedQuestionsToDB(reportId, data.questions);
    // Step 4: TODO — Parse `data.questions` and insert into DB
    // (You'll handle this in the next step.)

  } catch (err) {
    console.error("❌ generateDerivedQuestions.ts: Failed to generate derived questions:", err);
  }

}


/**
 * We will upload the derived questions to the database in a separate function.
 * This function will be called after the LLM response is received.
 */
export async function saveDerivedQuestionsToDB(
    reportId: string,
    questionsData: {
      employeeId: number;
      role: ParticipantRole;
      questions: string[];
    }[]
  ): Promise<void> {
    console.log("generateDerivedQuestions.ts: saveDerivedQuestionsToDB: Saving derived questions to DB for reportId:", reportId);
    try {
      const rows = questionsData.flatMap(( {employeeId, role, questions}) =>
        questions.map((question) => ({
          report_id: reportId,
          employee_id: employeeId,
          role,
          question,
          status: "pending", // Initial status
        }))
      );

      const { error } = await supabase.from("derived_questions").insert(rows);
      if (error) {
        console.error("❌ generateDerivedQuestions.ts: saveDerivedQuestionsToDb: Failed to insert derived questions", error);
        throw new Error("generateDerivedQuestions.ts: Failed to insert derived questions: " + error.message);
      }

      console.log("✅ generateDerivedQuestions.ts: saveDerivedQuestionsToDB: Successfully saved derived questions to DB");
    } catch (error) {
      console.error("❌ generateDerivedQuestions.ts: saveDerivedQuestionsToDB: Error saving derived questions to DB:", error);
    }
  }