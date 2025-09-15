import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "@/lib/supabase"
import { ParticipantRole, EmailTemplate } from "@/app/types"
import { getEmailTemplateByRole } from "@/templates/email/index"
import employeeDisputeAgent from "@/app/agentConfigs/disputeResolutionAgent";
import { languageInstruction, identityInstruction, toneLanguageInstruction, nameHandlingPolicy, roleInstructionsClaimantFirstConversation, roleInstructionsDefendant, 
  roleInstructionsWitness, conversationStructureInstruction, summaryClosureInstruction, signaturePhrasesInstruction, redFlagsInstruction, 
  outcomesInstruction, sampleConversations
 } from "@/app/agentConfigs/disputeResolutionAgent";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Given a report ID and a conversation ID, return the employee ID (participant).
 */ 

export async function getEmployeeIdFromConversation(
  reportId: string,
  conversationId: string
): Promise<number | 0> {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("participant")
      .eq("report_id", reportId)
      .eq("id", conversationId)
      .single();

    if (error) {
      console.error("utils.ts: Error fetching employee ID:", error);
      return 0;
    }

    return data?.participant || null;
  } catch (error) {
    console.error("utils.ts: Unexpected error fetching employee ID:", error);
    return 0;
  }
}

/**
 * Given an employee ID, return the employee's first and last name.
 */
export async function getFirstNameLastNameFromEmployeeId(
  employeeId: number
): Promise<{ firstName: string; lastName: string } | null > {
  console.log("utils.ts: Fetching employee name for Id:", employeeId);
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("first_name, last_name")
      .eq("id", employeeId)
      .single();

    if (error) {
      console.error("utils.ts: Error fetching employee name:", error);
      return null;
    }

    return {
      firstName: data?.first_name || "",
      lastName: data?.last_name || "",
    };
  } catch (error) {
    console.error("utils.ts: Unexpected error fetching employee name:", error);
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
 * 
 * @param reportId 
 * @param employeeID 
 * @returns string[] of questions to ask the employee.
 * getDerivedQuestions takes a reportId and employeeID and returns an array of questions to ask the employee.
 * It queries the derived_questions table to find all questions associated with the reportId and employeeID.
 * How this value is Used: This function is used to get the questions to ask the employee in the conversation.
 * It is called when the conversation is NOT the first one in the report.
 */

export async function getDerivedQuestions(reportId: string, employeeId: number)
: Promise<string[]>{
  try{
    const { data, error} = await supabase.from("derived_questions")
      .select("question")
      .eq("report_id", reportId)
      .eq("employee_id", employeeId)
      .order("created_at", { ascending: true });

      if (error || !data) {
        console.error("utils.ts: Error fetching derived questions:", error);
        return [];
      }
      return data.map((item) => item.question);
    
  } catch (error) {
    console.error("utils.ts: Error fetching derived questions:", error);
    return [];
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
  const employeeRole = employeeId ? await getEmployeeRoleInReport(reportId, employeeId) : null;
  const isFirstConversationFlag = await isFirstConversation(reportId, conversationId);
  const questions_to_ask = isFirstConversationFlag ? [] : await getDerivedQuestions(reportId, employeeId);

  console.log("BUILD INSTRUCTIONS: employeeId:", employeeId, "employeeName:", employeeName, "employeeRole:", employeeRole, "isFirstConversationFlag:", isFirstConversationFlag);
  console.log("BUILD INSTRUCTIONS: questions_to_ask:", questions_to_ask);

  const greetingInstruction = employeeName ? `Always greet the employee by their first name, ${employeeName.firstName} 
  when referring to them . Start the conversation with saying "Hi ${employeeName.firstName}"` : "";

  const all_participant_names = await getAllParticipantNamesAndEmails(reportId);
  console.log("BUILD INSTRUCTIONS: all_participant_names:", all_participant_names);

  const roleObjectiveInstruction = getObjectiveInstruction(
    employeeRole,
    isFirstConversationFlag,
    questions_to_ask
  );

  const participantRoster = formatParticipantRosterForInstructions(all_participant_names);

  const fullInstruction = [
    languageInstruction,
    identityInstruction,
    toneLanguageInstruction,
    greetingInstruction,
    participantRoster,
    nameHandlingPolicy,
    roleObjectiveInstruction,
    conversationStructureInstruction,  
    summaryClosureInstruction,
    redFlagsInstruction,
    signaturePhrasesInstruction,
    outcomesInstruction,
    sampleConversations,
  ]
    .filter(Boolean)
    .join("\n\n");

  /**
   * For this Employee ID and the Report ID, get ALL the questions to ask the Employee Here
   */
  console.log("UTILS: The greeting instruction is:", greetingInstruction);
  return `${fullInstruction}`;

}


/**
 * Builds the objective instruction section based on role and context
 */
export function getObjectiveInstruction(
  role: ParticipantRole | null,
  isFirstConversation: boolean,
  questions: string[]
): string {
  if (!role) return "";

  let roleInstruction = "";

  if (role === "claimant" && isFirstConversation) {
    roleInstruction = roleInstructionsClaimantFirstConversation;
  } else if (role === "defendant") {
    roleInstruction = roleInstructionsDefendant;
  } else if (role === "witness") {
    roleInstruction = roleInstructionsWitness;
  }

  const questionsBlock =
    !isFirstConversation && questions.length > 0
      ? `\n\n### Questions to Ask\n${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
      : "";

  return `# Objective\n${roleInstruction}${questionsBlock}`;
}


/**
 * getAllParticipantNames: Retrieve all participant names in a report.
 * Returns the role, first name, and last name of each participant in the report.
 * @param reportId The ID of the report to fetch participants for.
 * @returns An array of objects containing the role, first name, and last name of each
 * Example return value:
 * [
    { role: "claimant", firstName: "Juhi", lastName: "Dubey" },
    { role: "defendant", firstName: "Jack", lastName: "Smith" },
    { role: "defendant", firstName: "John", lastName: "Doe" },
    { role: "witness", firstName: "Varun", lastName: "Kumar" },
    { role: "witness", firstName: "Maria", lastName: "Garcia" }
    ]
 * 
 */
export async function getAllParticipantNamesAndEmails(reportId:string): Promise<{ role: ParticipantRole; firstName: string; lastName: string; emailID: string }[]> {
  try {
    const { data: participants, error: participantsError } = await supabase
      .from("reports")
      .select("claimant, defendants, witnesses")
      .eq("id", reportId)
      .single();

    if (participantsError || !participants) {
      console.error("utils.ts: Error fetching participants:", participantsError);
      return [];
    }

    // Fetch the IDs of all the participants from the report
    const { claimant, defendants, witnesses } = participants;
    const participantIds = [
      claimant,
      ...(defendants || []),
      ...(witnesses || []),
    ];

    if (participantIds.length === 0) {
      console.warn("utils.ts: No participants found for report:", reportId);
      return [];
    }

    // Fetch the names of all participants using their IDs
    const { data: employee, error: namesError } = await supabase
      .from("employees")
      .select("id, first_name, last_name, email_address")
      .in("id", participantIds);
    
    if (namesError || !employee) {
      console.error("utils.ts: Error fetching participant names:", namesError);
      return [];
    }

    // Map the IDs to Names
    const idToName = new Map<number, { firstName: string; lastName: string; emailID: string }>();
    for (const emp of employee) {
      idToName.set(emp.id, { firstName: emp.first_name, lastName: emp.last_name, emailID: emp.email_address });
    }

    // Create the final array of participant names with roles
    const result : { role: ParticipantRole; firstName: string; lastName: string; emailID: string }[] = [];
    if (claimant && idToName.has(claimant)) {
      result.push({
        role: "claimant",
        firstName: idToName.get(claimant)!.firstName, // The ! operator is used to tell the compliler that the value is not undefined
        lastName: idToName.get(claimant)!.lastName,
        emailID: idToName.get(claimant)!.emailID,
      });
    }

    for (const defendant of defendants || []) {
      if (idToName.has(defendant)) {
        result.push({
          role: "defendant",
          firstName: idToName.get(defendant)!.firstName,
          lastName: idToName.get(defendant)!.lastName,
          emailID: idToName.get(defendant)!.emailID,
        });
      }
    }

    for (const witness of witnesses || []) {
      if (idToName.has(witness)) {
        result.push({
          role: "witness",
          firstName: idToName.get(witness)!.firstName,
          lastName: idToName.get(witness)!.lastName,
          emailID: idToName.get(witness)!.emailID,
        });
      }
    } 
    
    return result;

  } catch (error) {
    console.error("utils.ts: Error fetching participant names:", error);
    return [];
  }
  return [];
}


/**
 * 
 * @param participants Array of participants with their roles and names
 * @returns Formatted string for inclusion in agent instructions
 * The input is received from the getAllParticipantNames function's output.
 * The output is a formatted string that groups participants by their roles and lists their names.
 * Example input:
 * [
    { role: "claimant", firstName: "Juhi", lastName: "Dubey" },
    { role: "defendant", firstName: "Jack", lastName: "Smith" },
    { role: "defendant", firstName: "John", lastName: "Doe" },
    { role: "witness", firstName: "Varun", lastName: "Kumar" },
    { role: "witness", firstName: "Maria", lastName: "Garcia" }
    ]
*
* Example output:
* # Participants in This Case (Canonical Spellings)
  - Claimant: Juhi Dubey
  - Defendants: Jack Smith, John Doe
  - Witnesses: Varun Kumar, Maria Garcia
*/

export function formatParticipantRosterForInstructions(participants: { role: ParticipantRole; firstName: string; lastName: string; emailID: string }[]): string {
  const grouped = {
    claimant: null as string | null,
    defendants: [] as string[],
    witnesses: [] as string[],
  };

  for (const p of participants) {
    const fullName = `${p.firstName} ${p.lastName}`;
    if(p.role === "claimant") {
      grouped.claimant = fullName;
    } else if (p.role === "defendant") {
      grouped.defendants.push(fullName);
    } else if (p.role === "witness") {
      grouped.witnesses.push(fullName); 
    }   
  }

  const participantsInfo: string[] = [];
  participantsInfo.push("# Participants in This Case (Canonical Spellings)");
  if (grouped.claimant) {
    participantsInfo.push(`- Claimant: ${grouped.claimant}`);
  }
  if (grouped.defendants.length > 0) {
    participantsInfo.push(`- Defendants: ${grouped.defendants.join(", ")}`);
  }
  if (grouped.witnesses.length > 0) {
    participantsInfo.push(`- Witnesses: ${grouped.witnesses.join(", ")}`);
  }
  participantsInfo.push("Use the exact spellings of the names as provided above.");
  return participantsInfo.join("\n");

}

/**
 * 
 * @param reportId 
 * @param conversationId 
 * @returns void
 * sendNotifications checks if the conversation is the first one in the report.
 * If it is, it returns.
 * If not, it fetches all participant names and email addresses in the report.
 * It then logs a message indicating that an email would be sent to each defendant and witness.
 * Note: The actual email sending functionality is not implemented;
 */

export async function sendNotifications(reportId: string, conversationId: string) {
  try {
    const isFirst = await isFirstConversation(reportId, conversationId);
    if (!isFirst) {
      console.log(`🔕 Not the first conversation for report ${reportId}, skipping notifications.`);
      return;
    }

    const participants = await getAllParticipantNamesAndEmails(reportId);

    for (const p of participants) {
      if (p.role === "defendant" || p.role === "witness") {
        const email = createEmailContent(p.role, p.firstName);
        if (email) {
            console.log(`UTILS: 📧 Sending email to ${p.firstName} ${p.lastName} at address ${p.emailID}`);
            console.log("Email Subject:", email.subject);
            console.log("Email Body:", email.body);
            // FUTURE: Integrate with email service to send the email.
        }
      }
    }
  } catch (error) {
    console.error("utils.ts: Error in sendNotifications:", error);
  }
}

/**
 *          
 * @param role 
 * @param firstName 
 * @param link 
 * @returns  EmailTemplate | null
 * This function creates the email content by replacing placeholders for name and link in the template with actual values.
 * It takes the role, first name, and a unique link as inputs.
 * Uses role to get the template, then replaces {name} and {link} in the template body.
 * If no template is found for the role, it returns null and logs a warning.
 */
export function createEmailContent(role: ParticipantRole, firstName: string, link: string = "https://demo.hrmny-hr.com/revisit-case"): EmailTemplate | null {
  const template = getEmailTemplateByRole(role);
  if (!template){
    console.warn("utils.ts createEmailContent :  No email template found for role:", role);
    return null;
  }
  const bodyWithName = template.body.replaceAll("{{name}}", firstName).replaceAll("{{link}}", link);
  return {
    subject: template.subject,
    body: bodyWithName
  };
}



