import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "@/lib/supabase"
import employeeDisputeAgent from "@/app/agentConfigs/disputeResolutionAgent";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Given a report ID and a conversation ID, return the employee ID (participant).
 */

export async function getEmployeeIdFromConversation(
  reportId: string,
  conversationId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("participant")
      .eq("report_id", reportId)
      .eq("id", conversationId)
      .single();

    if (error) {
      console.error("Error fetching employee ID:", error);
      return null;
    }

    return data?.participant || null;
  } catch (error) {
    console.error("Unexpected error fetching employee ID:", error);
    return null;
  }
}

/**
 * Given an employee ID, return the employee's first and last name.
 */
export async function getFirstNameLastNameFromEmployeeId(
  employeeId: string
): Promise<{ firstName: string; lastName: string } | null> {
  console.log("UTILS: Fetching employee name for Id:", employeeId);
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("first_name, last_name")
      .eq("id", employeeId)
      .single();

    if (error) {
      console.error("Error fetching employee name:", error);
      return null;
    }

    return {
      firstName: data?.first_name || "",
      lastName: data?.last_name || "",
    };
  } catch (error) {
    console.error("Unexpected error fetching employee name:", error);
    return null;
  }
} 

/**
 * Build voice agent instructions by combining base agent instructions with a personalized greeting.
 * This function retrieves the employee's name based on the report ID and conversation ID,
 * and constructs a greeting instruction to be included in the agent's instructions.
 * This function collects the baseInstrcution from the Agent Config and adds a personalized greeting
 * based on the employee's first name.
 * FUTURE: All dynamic layers of the agent instructions should be handled here.
 */

export async function buildVoiceAgentInstructions(
  reportId: string,
  conversationId: string
): Promise<string> {
  console.log("BUILD INSTRUCTIONS: Inputs → reportId:", reportId, "conversationId:", conversationId);
  const employeeId = await getEmployeeIdFromConversation(reportId, conversationId);
  const employeeName = employeeId ? await getFirstNameLastNameFromEmployeeId(employeeId) : null;

  const baseInstructions = employeeDisputeAgent.instructions || "";
  const greetingInstruction = employeeName ? `Always greet the employee by their first name, ${employeeName.firstName} 
  when referring to them . Start the conversation with saying "Hi ${employeeName.firstName}, how may I help you today?"` : "";

  /**
   * For this Employee ID and the Report ID, get ALL the questions to ask the Employee Here
   */
  console.log("UTILS: The greeting instruction is:", greetingInstruction);
  return `${greetingInstruction}\n\n${baseInstructions}`;

}