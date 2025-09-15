import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function POST(request: Request) {
    try {
        const { to, subject, body } = await request.json();
        console.log(`ROUTE: 📧 Sending email to ${to} with subject ${subject} and body ${body}`);
        const data = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL_ID || "HRMNY HR <HR@resend.dev>",
            to: to,
            subject: subject,
            html: body,
        });
        if (data.error) {
            console.error("api/email/send ROUTE: ❌ Error response from Resend:", data.error);
            return NextResponse.json({ message: "Error sending email" }, { status: 500 });
        }   
    } catch (error) {
        console.error("ROUTE: ❌ Error sending email:", error);
        return NextResponse.json({ message: "Error sending email" }, { status: 500 });
    }

    return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
}