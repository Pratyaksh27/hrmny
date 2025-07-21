import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "@/lib/supabase"
import { ParticipantRole } from "@/app/types"
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
 * Get the role of the employee in the Report. It will be used to generate specific intructions for them .
 * @param reportId Get 
 * @param conversationId 
 * @returns "role" of the employee in the conversation, 
 */

export async function getEmployeeRoleInReport(
  reportId: string,
  employeeId: number
): Promise<ParticipantRole | null> {
  try {
    const { data, error } = await supabase
      .from("reports")
      .select("claimant, defendants, witnesses")
      .eq("id", reportId)
      .single();

    if (error) {
      console.error("utils.ts : Error fetching employee role:", error);
      return null;
    }

    const { claimant, defendants, witnesses } = data || {};
    let role: ParticipantRole | null = null;
    if (employeeId === claimant) role = "claimant";
    if (defendants && defendants.includes(employeeId)) role = "defendant";
    if (witnesses && witnesses.includes(employeeId)) role = "witness";

    console.log("utils.ts : Employee role in report:", { employeeId, role });
    
    // If the employee is not found in any of the roles, return null
    return role;

  } catch (error) {
    console.error("utils.ts : Unexpected error fetching employee role:", error);
    return null;
  }
}

/**
 * 
 * @param reportId 
 * @param conversationId 
 * @returns true/false
 * isFirstConversation takes a conversationId, reportId and checks if the conversation is the first one in the report.
 * It queries the conversations table to find all conversations associated with the reportId,
 * orders them by creation date, and checks if the provided conversationId matches the first one. 
 * How thi value is Used: If the conversation is NOT the first one, then we will call get_derived_questions
 * to get the questions to ask the employee. If it is the first conversation, we will not call get_derived_questions.

 */
export async function isFirstConversation(
  reportId: string,
  conversationId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("id")
      .eq("report_id", reportId)
      .order("created_at", { ascending: true })
      
      if (error || !data || data.length === 0) {
        console.error("utils.ts: Error fetching conversations or no conversations found:", error);
        return false;
      }

      return data[0].id === conversationId;
  } catch (error) {
    console.error("utils.ts: Unexpected error checking first conversation:", error);
    return false;
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
  const employeeRole = employeeId ? await getEmployeeRoleInReport(reportId, parseInt(employeeId)) : null;
  const isFirstConversationFlag = await isFirstConversation(reportId, conversationId);

  console.log("BUILD INSTRUCTIONS: employeeId:", employeeId, "employeeName:", employeeName, "employeeRole:", employeeRole, "isFirstConversationFlag:", isFirstConversationFlag);

  const baseInstructions = employeeDisputeAgent.instructions || "";
  const greetingInstruction = employeeName ? `Always greet the employee by their first name, ${employeeName.firstName} 
  when referring to them . Start the conversation with saying "Hi ${employeeName.firstName}, how may I help you today?"` : "";

  /**
   * For this Employee ID and the Report ID, get ALL the questions to ask the Employee Here
   */
  console.log("UTILS: The greeting instruction is:", greetingInstruction);
  return `${greetingInstruction}\n\n${baseInstructions}`;

}