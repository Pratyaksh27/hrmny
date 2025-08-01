import { buildConversationSummariesForReport } from "./buildConversationSummaries";
import { getGuidanceDocuments } from "./getGuidanceDocuments";
import { reportGenerationInstructions } from "@/app/agentConfigs/reportGenerationInstructions";

/**
 * Generates a structured prompt for the LLM to create an HR report.
 * Includes: base instructions, guidance documents, and conversation summaries.
 */
export async function generateInstructionsForReport(reportId: string): Promise<string> {
  // Step 1: Get conversation summaries
  const conversations = await buildConversationSummariesForReport(reportId);

  // Step 2: Get HR policy and labor law documents
  const documents = await getGuidanceDocuments();
  const docsContext = documents
    .map(doc => `## ${doc.title}\n\n${doc.content}`)
    .join("\n\n");

  // Step 3: Format conversations for prompt
  const conversationText = conversations
    .map(c => {
      const messages = c.normalizedTranscript
        .map(m => `- ${m.role.toUpperCase()}: ${m.content}`)
        .join("\n");
      return `### Conversation with ${c.employeeName} (${c.role})\n${messages}`;
    })
    .join("\n\n");

  // Step 4: Final Prompt
  const fullPrompt = `
${reportGenerationInstructions}

---

## Context: Company Documents
${docsContext}

---

## Context: Transcripts
${conversationText}
`;

  return fullPrompt.trim();
}
