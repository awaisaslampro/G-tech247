import { NextResponse } from "next/server";
import {
  ALLOWED_CV_TYPES,
  ALLOWED_IDENTITY_DOCUMENT_TYPES,
  MAX_CV_SIZE_BYTES
} from "@/lib/constants";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getServiceSupabaseClient } from "@/lib/supabase/server";

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

function normalizeFileField(value: FormDataEntryValue | null): File | null {
  if (!(value instanceof File)) {
    return null;
  }

  if (value.size === 0 || !value.name) {
    return null;
  }

  return value;
}

function validateCvFile(file: File): string | null {
  if (file.size > MAX_CV_SIZE_BYTES) {
    return "CV must be less than 5MB.";
  }

  if (!ALLOWED_CV_TYPES.includes(file.type)) {
    return "CV must be PDF, DOC, DOCX, or TXT.";
  }

  return null;
}

function validateIdentityDocument(file: File): string | null {
  if (file.size > MAX_CV_SIZE_BYTES) {
    return "Identity document must be less than 5MB.";
  }

  if (!ALLOWED_IDENTITY_DOCUMENT_TYPES.includes(file.type)) {
    return "Identity document must be PDF, PNG, or JPG/JPEG.";
  }

  return null;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const position = String(formData.get("position") || "").trim();
  const coverLetter = String(formData.get("coverLetter") || "").trim();
  const cv = normalizeFileField(formData.get("cv"));
  const identityDocument = normalizeFileField(formData.get("identityDocument"));

  if (!fullName || !email || !phone || !position) {
    return NextResponse.json({ message: "Please fill all required fields." }, { status: 400 });
  }

  if (!cv) {
    return NextResponse.json({ message: "CV file is required." }, { status: 400 });
  }

  const cvValidationError = validateCvFile(cv);
  if (cvValidationError) {
    return NextResponse.json({ message: cvValidationError }, { status: 400 });
  }

  if (!identityDocument) {
    return NextResponse.json({ message: "Identity document is required." }, { status: 400 });
  }

  const identityDocumentValidationError = validateIdentityDocument(identityDocument);
  if (identityDocumentValidationError) {
    return NextResponse.json({ message: identityDocumentValidationError }, { status: 400 });
  }

  const supabase = getServiceSupabaseClient();
  const id = crypto.randomUUID();
  const uploadedPaths: string[] = [];

  const safeCvFileName = sanitizeFileName(cv.name);
  const cvPath = `${id}/${Date.now()}-cv-${safeCvFileName}`;
  const { error: cvUploadError } = await supabase.storage.from("cvs").upload(cvPath, cv, {
    contentType: cv.type,
    upsert: false
  });

  if (cvUploadError) {
    return NextResponse.json({ message: `CV upload failed: ${cvUploadError.message}` }, { status: 500 });
  }

  uploadedPaths.push(cvPath);

  const safeIdentityDocumentFileName = sanitizeFileName(identityDocument.name);
  const identityDocumentPath = `${id}/${Date.now()}-identity-document-${safeIdentityDocumentFileName}`;
  const { error: identityDocumentUploadError } = await supabase.storage
    .from("cvs")
    .upload(identityDocumentPath, identityDocument, {
      contentType: identityDocument.type,
      upsert: false
    });

  if (identityDocumentUploadError) {
    await supabase.storage.from("cvs").remove(uploadedPaths);
    return NextResponse.json(
      { message: `Identity document upload failed: ${identityDocumentUploadError.message}` },
      { status: 500 }
    );
  }

  uploadedPaths.push(identityDocumentPath);

  const { error: insertError } = await supabase.from("applications").insert({
    id,
    full_name: fullName,
    email,
    phone,
    position,
    cover_letter: coverLetter || null,
    cv_path: cvPath,
    cv_file_name: safeCvFileName,
    identity_document_path: identityDocumentPath,
    identity_document_file_name: safeIdentityDocumentFileName
  });

  if (insertError) {
    await supabase.storage.from("cvs").remove(uploadedPaths);
    return NextResponse.json(
      { message: `Application save failed: ${insertError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id }, { status: 201 });
}

export async function GET(request: Request) {
  const allowed = await isAdminAuthenticated();
  if (!allowed) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const position = searchParams.get("position")?.trim() || "";

  const supabase = getServiceSupabaseClient();
  let query = supabase
    .from("applications")
    .select(
      "id, full_name, email, phone, position, cover_letter, cv_path, cv_file_name, identity_document_path, identity_document_file_name, created_at",
      {
        count: "exact"
      }
    )
    .order("created_at", { ascending: false });

  if (position) {
    query = query.eq("position", position);
  }

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ applicants: data || [], totalCount: count || 0 });
}
