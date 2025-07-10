import { getTargetParticipants } from "./getTargetParticipants";
import { TranscriptItem } from "@/app/types";

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
        console.log(`Target Participant: ${participant.employeeId}, Role: ${participant.role || "unknown"}`);
    });

    // questions = call LLM (transcriptItems, targetParticipants)
    // For each question, Enter into the derived_questions table

}