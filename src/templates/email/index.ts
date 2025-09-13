import { ParticipantRole, EmailTemplate } from "@/app/types";
import { defendantHtml, defendantSubject } from "./defendant";
import { witnessHtml, witnessSubject } from "./witness";

export function getEmailTemplateByRole(role: ParticipantRole): EmailTemplate | null {
  switch (role) {
    case "defendant":
      return { subject: defendantSubject, body: defendantHtml };
    case "witness":
      return { subject: witnessSubject, body: witnessHtml };
    default:
      return null;
  }
}

// Future roles can be added here with their respective templates
// e.g., claimant, hr, manager, etc.
