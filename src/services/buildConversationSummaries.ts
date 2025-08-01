import { supabase } from "@/lib/supabase";
import { getFirstNameLastNameFromEmployeeId, getEmployeeRoleInReport } from "@/lib/utils";
import { normalizeTranscript } from "@/lib/normalizeTranscript";
import { TranscriptItem, NormalizedTranscriptItem, ConversationSummary, ParticipantRole } from "@/app/types";

/**
 * @param reportId - The ID of the report for which to build conversation summaries.
 * @returns allConversations - An array of conversation summaries for the report.
 * ConvesartionSummary is [{employeeId, employeeName, role, normalizedTranscript}]
 * Fetch ALL conversations for the report
 * For Each Conversation, get the employeeId, employeeName, role and normalizedTranscript. Add it to the allConversations array
 * Return the allConversations array.
 * If no conversations are found, return an empty array.
 * If an error occurs, log the error and throw a new error.
 */
export async function buildConversationSummariesForReport(
    reportId: string
): Promise<ConversationSummary[]> {
    const allConversations: ConversationSummary[] = [];
    try {
        // Fetch all conversations for the report
        const { data: conversations, error: convoError } = await supabase
            .from("conversations")
            .select("id, participant, transcript")
            .eq("report_id", reportId);
        
        if (convoError) {
            console.error("buildConversationSummaries: Error fetching conversations:", convoError);
            throw new Error("buildConversationSummaries: Failed to fetch conversations");
        }

        if (!conversations || conversations.length === 0) {
            console.warn("buildConversationSummaries: No conversations found for reportId:", reportId);
            return []; // Return empty array if no conversations found
        }

        // Get the employee ID, Full name, and role for each conversation
        // All conversations are also normalized
        // Add each conversation summary {employeeId, employeeName, role, normalizedTranscript} to the allConversations array
        for (const convo of conversations) {
            const employeeId = convo.participant;
            const result = await getFirstNameLastNameFromEmployeeId(employeeId);
            const employeeName = result && result.firstName && result.lastName? `${result.firstName} ${result.lastName}`.trim() : "Unknown Employee";
            const role = await getEmployeeRoleInReport(reportId, employeeId) ?? "unknown";
            const transcriptItems: TranscriptItem[] = convo.transcript || [];
            const normalizedTranscript = normalizeTranscript(transcriptItems);
            allConversations.push({
                employeeId,
                employeeName,
                role: role as ParticipantRole,
                normalizedTranscript: normalizedTranscript as NormalizedTranscriptItem[],
            });
        }
    } catch (error) {
        console.error("buildConversationSummaries: Error building conversation summaries:", error);
        throw new Error("buildConversationSummaries: Failed to build conversation summaries");
    }
    return allConversations;
}
