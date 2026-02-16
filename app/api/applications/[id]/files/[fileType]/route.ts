import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getServiceSupabaseClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string; fileType: string }>;
};

const FILE_COLUMN_MAP: Record<string, string> = {
  cv: "cv_path",
  "identity-document": "identity_document_path"
};

export async function GET(_request: Request, context: RouteContext) {
  const allowed = await isAdminAuthenticated();
  if (!allowed) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id, fileType } = await context.params;
  const targetColumn = FILE_COLUMN_MAP[fileType];

  if (!targetColumn) {
    return NextResponse.json({ message: "Invalid file type." }, { status: 400 });
  }

  const supabase = getServiceSupabaseClient();
  const { data: application, error: fetchError } = await supabase
    .from("applications")
    .select(targetColumn)
    .eq("id", id)
    .single();

  if (fetchError || !application) {
    return NextResponse.json({ message: "Application not found." }, { status: 404 });
  }

  const filePath = application[targetColumn as keyof typeof application];
  if (!filePath || typeof filePath !== "string") {
    return NextResponse.json({ message: "Requested file not available." }, { status: 404 });
  }

  const { data, error } = await supabase.storage.from("cvs").createSignedUrl(filePath, 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ message: "Unable to generate file link." }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
