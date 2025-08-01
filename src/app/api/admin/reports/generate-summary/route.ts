import { NextRequest, NextResponse } from "next/server";
import { generateInstructionsForReport } from "@/services/generateInstructionsForReport";
import { supabase } from "@/lib/supabase";
import { openai } from "@/server/openai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportId } = body;

    if (!reportId) {
      return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
    }

    // Step 1: Generate the LLM prompt
    const prompt = await generateInstructionsForReport(reportId);

    // Step 2: Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // or "gpt-4" or "gpt-3.5-turbo"
      messages: [
        { role: "system", content: "You are a professional HR assistant helping write structured incident reports." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    });

    const generatedReport = response.choices[0]?.message?.content?.trim();
    console.log("Generated Report:", generatedReport);
 
    if (!generatedReport) {
      return NextResponse.json({ error: "No response from LLM" }, { status: 500 });
    }

    // Step 3: Save the report to Supabase
    const { error: updateError } = await supabase
      .from("reports")
      .update({ generated_summary: generatedReport })
      .eq("id", reportId);

    if (updateError) {
      console.error("Failed to save report:", updateError);
      return NextResponse.json({ error: "Failed to save report to DB" }, { status: 500 });
    }

    // Success
    return NextResponse.json({ success: true, report: generatedReport });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
