import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const cursor = searchParams.get("cursor");
        const status = searchParams.get("status");

        let query = supabase
            .from("reports")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit+1); // Fetch one extra item to check for next page
        
            // Add cursor filter for pagination
        if (cursor) {
            query = query.lt("created_at", cursor);
        }
        // Add status filter if provided
        if (status) {
            query = query.eq("status", status);
        }

        const { data, error } = await query;
        if (error) {
            console.error("API/Admin/Reports: Error fetching reports:", error);
            return NextResponse.json({ error: "API/Admin/Reports: Failed to fetch reports" }, { status: 500 });
        }

        const hasNextPage = data.length > limit;
        const reports = hasNextPage ? data.slice(0, limit) : data;
        const nextCursor = hasNextPage ? reports[reports.length - 1].created_at : null;

        return NextResponse.json({
            data: reports,
            nextCursor,
            hasNextPage
        });
    }
    catch (error) {
        console.error("API/Admin/Reports: Error processing request:", error);
        return NextResponse.json({ error: "API/Admin/Reports: Internal Server Error" }, { status: 500 });
    }
}