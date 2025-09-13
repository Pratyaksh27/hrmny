export const defendantSubject = "Request to speak with HRMNY regarding an ongoing case";

export const defendantHtml = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;padding:24px 0;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;font-family:Arial,Helvetica,sans-serif;">
        <tr>
          <td style="padding:24px 24px 0 24px;">
            <h2 style="margin:0 0 8px 0;font-size:20px;line-height:28px;color:#111827;">Hi {{name}},</h2>
            <p style="margin:0 0 16px 0;font-size:14px;line-height:22px;color:#374151;">
              You’ve been listed as a <strong>defendant</strong> in an HR case and we’d like you to speak with HRMNY,
              our conversational HR assistant. Please use the secure link below to start your brief interview.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 24px 16px 24px;">
            <a href="{{link}}" 
               style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;font-size:14px;">
               Start your interview
            </a>
            <p style="margin:12px 0 0 0;font-size:12px;line-height:18px;color:#6b7280;">
              This link is unique to you. If it doesn’t open, copy and paste it into your browser: {{link}}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 24px 24px 24px;font-size:12px;line-height:18px;color:#6b7280;">
            <em>Please do not forward this email. For questions, contact HR.</em>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;
