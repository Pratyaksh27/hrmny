import { supabase } from "@/lib/supabase";
import { GuidanceDocument } from "@/app/types";

export async function getGuidanceDocuments(): Promise<GuidanceDocument[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("title, type, content")
    .in("type", ["labor_law", "company_policy"]);

  if (error) {
    console.error("getGuidanceDocuments: Error fetching documents", error);
    throw new Error("Failed to fetch labor law and company policy documents");
  }

  return (data || []) as GuidanceDocument[];
}