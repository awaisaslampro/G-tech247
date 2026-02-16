import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getServiceSupabaseClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const allowed = await isAdminAuthenticated();
  if (!allowed) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const supabase = getServiceSupabaseClient();

  const { data: application, error: fetchError } = await supabase
    .from("applications")
    .select("cv_path")
    .eq("id", id)
    .single();

  if (fetchError || !application?.cv_path) {
    return NextResponse.json({ message: "Application not found." }, { status: 404 });
  }

  const { data, error } = await supabase.storage.from("cvs").createSignedUrl(application.cv_path, 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ message: "Unable to generate CV link." }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
