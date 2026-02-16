import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const allowed = await isAdminAuthenticated();
  if (!allowed) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceSupabaseClient();
  const { count, error } = await supabase
    .from("applications")
    .select("*", { head: true, count: "exact" });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ totalCount: count || 0 });
}
