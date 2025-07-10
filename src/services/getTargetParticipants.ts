import { supabase } from "@/lib/supabase";
import { TargetParticipant } from "@/app/types";

export async function getTargetParticipants(
    conversationId: string
): Promise<TargetParticipant[]> {
    try {
        const { data: conversation, error : convoError} = await supabase
            .from("conversations")
            .select("report_id, participant")
            .eq("id", conversationId)
            .single();

        if (convoError || !conversation) {
            console.error("getTargetParticipant: Error fetching conversation:", convoError);
            return [];
        }

        const { data: report, error: reportError } = await supabase
            .from("reports")
            .select("claimant, defendants, witnesses")
            .eq("id", conversation.report_id)
            .single();

        if (reportError || !report) {
            console.error("getTargetParticipant: Error fetching report:", reportError);
            return [];
        }

        const allParticipants: TargetParticipant[] = [
            { employeeId: report.claimant, role: "claimant" },
            ...report.defendants.map((id: string) => ({ employeeId: id, role: "defendant" })),
            ...report.witnesses.map((id: string) => ({ employeeId: id, role: "witness" })),
        ];

        // Exclude the participant of the conversation
        return allParticipants.filter(
            (participant) => participant.employeeId !== conversation.participant
        );
    } catch (error) {
        console.error("getTargetParticipant: Error fetching target participants:", error);
        return [];
    }
}
