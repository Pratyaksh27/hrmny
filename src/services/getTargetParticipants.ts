import { supabase } from "@/lib/supabase";
import { TargetParticipant } from "@/app/types";

export async function getTargetParticipants(
    conversationId: string
): Promise<TargetParticipant[]> {
    try {
        // Step 1: Get conversation (participant, report_id)
        const { data: conversation, error : convoError} = await supabase
            .from("conversations")
            .select("report_id, participant")
            .eq("id", conversationId)
            .single();

        if (convoError || !conversation) {
            console.error("getTargetParticipant: Error fetching conversation:", convoError);
            return [];
        }
        const { report_id, participant: currentSpeakerId } = conversation;

        // Step 2: Get report participants
        const { data: report, error: reportError } = await supabase
            .from("reports")
            .select("claimant, defendants, witnesses")
            .eq("id", report_id)
            .single();

        if (reportError || !report) {
            console.error("getTargetParticipant: Error fetching report:", reportError);
            return [];
        }

        // Step 3: Flatten roles into a list
        const rawParticipants: {employeeId: number, role: "claimant" | "defendant" | "witness"}[] = [
            { employeeId: report.claimant, role: "claimant" },
            ...report.defendants.map((defendant: number) => ({ employeeId: defendant, role: "defendant" })),
            ...report.witnesses.map((witness: number) => ({ employeeId: witness, role: "witness" }))
        ];

        // Step 4: Filter out the current participant of the conversation
        const targets = rawParticipants.filter((participant) => participant.employeeId !== currentSpeakerId);
        // We need to do parseInt below because employeeId is a string in the reports and conversations, but int in employees table
        const targetIds = targets
            .map((participant) => participant.employeeId)
           


        if (targetIds.length === 0) { return []; }

        // Step 5: Fetch names for each target participant
        const { data: employees, error: employeeError } = await supabase
            .from("employees")
            .select("id, first_name, last_name")
            .in("id", targetIds);

        if (employeeError || !employees) {
            console.error("getTargetParticipant: Error fetching employee names:", employeeError);
            return [];
        }

        // Step 6: Map to TargetParticipant type
        const targetParticipants: TargetParticipant[] = targets.map((target) => {
            // const employee = employees.find((emp) => emp.id === target.employeeId);
            const employee = employees.find((emp) => emp.id === target.employeeId);

            return {
                employeeId: target.employeeId,
                role: target.role,
                firstName: employee?.first_name || "",
                lastName: employee?.last_name || ""
            };
        });

        return targetParticipants;

    } catch (error) {
        console.error("getTargetParticipant: Error fetching target participants:", error);
        return [];
    }
}
