import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET (
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { params } = context; // Access params from the context object
    const { id: reportId } = await params; // Await the params Promise
    if (!reportId) {
        return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from("reports")
            .select("generated_summary")
            .eq("id", reportId)
            .single();
        
        if (error) {
            console.error("api/admin/[id]/reports/summary: Error fetching report summary:", error);
            return NextResponse.json({ error: "api/admin/[id]/reports/summary: Failed to fetch report summary" }, { status: 500 });
        }

        if (!data || !data.generated_summary) {
            return NextResponse.json({ error: "api/admin/[id]/reports/summary: No summary found for this report" }, { status: 404 });
        }   

        return NextResponse.json({ summary: data.generated_summary });

    } catch (error) {
        console.error("api/admin/[id]/reports/summary: Error processing request:", error);
        return NextResponse.json({ error: "api/admin/[id]/reports/summary: Internal Server Error" }, { status: 500 });
    }
}