import { NextResponse } from "next/server";
import {
  ALLOWED_CV_TYPES,
  ALLOWED_IDENTITY_DOCUMENT_TYPES,
  CITIES_BY_COUNTRY,
  CITY_PROXIMITY_KM,
  COUNTRY_COVERAGE_OPTIONS,
  CountryCoverageOption,
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

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function distanceInKm(
  first: { lat: number; lng: number },
  second: { lat: number; lng: number }
): number {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(second.lat - first.lat);
  const deltaLng = toRadians(second.lng - first.lng);
  const lat1 = toRadians(first.lat);
  const lat2 = toRadians(second.lat);

  const haversine =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function isCountryCoverageOption(value: string): value is CountryCoverageOption {
  return COUNTRY_COVERAGE_OPTIONS.includes(value as CountryCoverageOption);
}

function validateCitiesCoverage(
  countryCovered: CountryCoverageOption | null,
  citiesCovered: string[]
): string | null {
  if (!countryCovered && citiesCovered.length > 0) {
    return "Please select a country before selecting cities covered.";
  }

  if (!countryCovered || citiesCovered.length === 0) {
    return null;
  }

  const availableCities = CITIES_BY_COUNTRY[countryCovered] || [];
  const cityMap = new Map(availableCities.map((city) => [city.name, city]));
  const selectedCitiesWithCoordinates = new Map<string, { name: string; lat: number; lng: number }>();

  for (const cityName of citiesCovered) {
    const city = cityMap.get(cityName);

    if (!city || typeof city.lat !== "number" || typeof city.lng !== "number") {
      continue;
    }

    selectedCitiesWithCoordinates.set(cityName, {
      name: city.name,
      lat: city.lat,
      lng: city.lng
    });
  }

  const cityValues = Array.from(selectedCitiesWithCoordinates.values());
  for (let i = 0; i < cityValues.length; i += 1) {
    for (let j = i + 1; j < cityValues.length; j += 1) {
      if (distanceInKm(cityValues[i], cityValues[j]) <= CITY_PROXIMITY_KM) {
        return "Selected cities must be at least 35 km apart.";
      }
    }
  }

  return null;
}

function getMissingSchemaColumn(errorMessage: string): string | null {
  const schemaCacheMatch = errorMessage.match(
    /Could not find the '([^']+)' column of 'applications' in the schema cache/i
  );
  if (schemaCacheMatch?.[1]) {
    return schemaCacheMatch[1];
  }

  const tableColumnMatch = errorMessage.match(
    /column\s+(?:"?applications"?\.)?"?([a-zA-Z0-9_]+)"?\s+does not exist/i
  );
  if (tableColumnMatch?.[1]) {
    return tableColumnMatch[1];
  }

  return null;
}

const APPLICATION_META_MARKER = "[APP_META_JSON]";

type ApplicationMeta = {
  city?: string;
  years_of_experience?: number | null;
  country_covered?: string | null;
  cities_covered?: string[] | null;
};

function buildCoverLetterWithMeta(coverLetter: string, meta: ApplicationMeta): string {
  const cleanedCoverLetter = coverLetter.trim();
  const markerIndex = cleanedCoverLetter.lastIndexOf(APPLICATION_META_MARKER);
  const originalCoverLetter =
    markerIndex >= 0 ? cleanedCoverLetter.slice(0, markerIndex).trimEnd() : cleanedCoverLetter;
  const metaJson = `${APPLICATION_META_MARKER}${JSON.stringify(meta)}`;

  if (!originalCoverLetter) {
    return metaJson;
  }

  return `${originalCoverLetter}\n\n${metaJson}`;
}

function parseMetaFromCoverLetter(coverLetter: unknown): ApplicationMeta | null {
  if (typeof coverLetter !== "string") {
    return null;
  }

  const markerIndex = coverLetter.lastIndexOf(APPLICATION_META_MARKER);
  if (markerIndex < 0) {
    return null;
  }

  const rawJson = coverLetter.slice(markerIndex + APPLICATION_META_MARKER.length).trim();
  if (!rawJson) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawJson) as Record<string, unknown>;
    const parsedCities = parsed.cities_covered;

    return {
      city: typeof parsed.city === "string" ? parsed.city : undefined,
      years_of_experience:
        typeof parsed.years_of_experience === "number" ? parsed.years_of_experience : null,
      country_covered: typeof parsed.country_covered === "string" ? parsed.country_covered : null,
      cities_covered: Array.isArray(parsedCities)
        ? parsedCities.filter((value): value is string => typeof value === "string")
        : null
    };
  } catch {
    return null;
  }
}

const BASE_APPLICATION_SELECT_COLUMNS = [
  "id",
  "full_name",
  "email",
  "phone",
  "position",
  "cover_letter",
  "cv_path",
  "cv_file_name",
  "identity_document_path",
  "identity_document_file_name",
  "created_at"
];

const OPTIONAL_APPLICATION_COLUMNS = [
  "city",
  "years_of_experience",
  "country_covered",
  "cities_covered"
];

export async function POST(request: Request) {
  const formData = await request.formData();
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const position = String(formData.get("position") || "").trim();
  const yearsOfExperienceRaw = String(formData.get("yearsOfExperience") || "").trim();
  const countryCoveredRaw = String(formData.get("countryCovered") || "").trim();
  const citiesCovered = formData
    .getAll("citiesCovered")
    .map((value) => String(value || "").trim())
    .filter(Boolean);
  const coverLetter = String(formData.get("coverLetter") || "").trim();
  const cv = normalizeFileField(formData.get("cv"));
  const identityDocument = normalizeFileField(formData.get("identityDocument"));

  if (!fullName || !email || !phone || !city || !position) {
    return NextResponse.json({ message: "Please fill all required fields." }, { status: 400 });
  }

  let yearsOfExperience: number | null = null;
  if (yearsOfExperienceRaw) {
    const parsedYears = Number(yearsOfExperienceRaw);
    if (!Number.isFinite(parsedYears) || parsedYears < 0) {
      return NextResponse.json(
        { message: "Years of experience must be a valid non-negative number." },
        { status: 400 }
      );
    }

    yearsOfExperience = parsedYears;
  }

  let countryCovered: CountryCoverageOption | null = null;
  if (countryCoveredRaw) {
    if (!isCountryCoverageOption(countryCoveredRaw)) {
      return NextResponse.json({ message: "Invalid country selected." }, { status: 400 });
    }

    countryCovered = countryCoveredRaw;
  }

  const citiesCoverageValidationError = validateCitiesCoverage(countryCovered, citiesCovered);
  if (citiesCoverageValidationError) {
    return NextResponse.json({ message: citiesCoverageValidationError }, { status: 400 });
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

  const baseInsertPayload = {
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
  };

  const insertPayload: Record<string, unknown> = {
    ...baseInsertPayload,
    city,
    years_of_experience: yearsOfExperience,
    country_covered: countryCovered,
    cities_covered: citiesCovered.length > 0 ? citiesCovered : null
  };
  const applicationMeta: ApplicationMeta = {
    city,
    years_of_experience: yearsOfExperience,
    country_covered: countryCovered,
    cities_covered: citiesCovered.length > 0 ? citiesCovered : null
  };
  const coverLetterWithMeta = buildCoverLetterWithMeta(coverLetter, applicationMeta);

  const fallbackColumns = new Set([
    "city",
    "years_of_experience",
    "country_covered",
    "cities_covered"
  ]);

  const payloadForInsert = { ...insertPayload };
  const droppedColumns: string[] = [];
  let insertError: { message: string } | null = null;

  for (let attempt = 0; attempt <= fallbackColumns.size; attempt += 1) {
    const { error } = await supabase.from("applications").insert(payloadForInsert);
    if (!error) {
      insertError = null;
      break;
    }

    const missingColumn = getMissingSchemaColumn(error.message);
    if (
      !missingColumn ||
      !fallbackColumns.has(missingColumn) ||
      !(missingColumn in payloadForInsert)
    ) {
      insertError = error;
      break;
    }

    payloadForInsert.cover_letter = coverLetterWithMeta;
    delete payloadForInsert[missingColumn];
    droppedColumns.push(missingColumn);
    insertError = error;
  }

  if (insertError) {
    await supabase.storage.from("cvs").remove(uploadedPaths);
    return NextResponse.json(
      {
        message: `Application save failed: ${insertError.message}. Please apply the latest database schema updates.`
      },
      { status: 500 }
    );
  }

  if (droppedColumns.length > 0) {
    return NextResponse.json(
      {
        ok: true,
        id,
        warning: `Saved with compatibility mode. Missing columns: ${droppedColumns.join(", ")}.`
      },
      { status: 201 }
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
  let selectColumns = [...BASE_APPLICATION_SELECT_COLUMNS, ...OPTIONAL_APPLICATION_COLUMNS];

  for (let attempt = 0; attempt <= OPTIONAL_APPLICATION_COLUMNS.length; attempt += 1) {
    let query = supabase
      .from("applications")
      .select(selectColumns.join(", "), {
        count: "exact"
      })
      .order("created_at", { ascending: false });

    if (position) {
      query = query.eq("position", position);
    }

    if (q) {
      query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
    }

    const { data, error, count } = await query;
    if (!error) {
      const applicants = (data || []).map((row) => {
        const applicant = (row || {}) as unknown as Record<string, unknown>;
        const parsedMeta = parseMetaFromCoverLetter(applicant.cover_letter);
        const cityValue = applicant.city;
        const yearsOfExperienceValue = applicant.years_of_experience;
        const countryCoveredValue = applicant.country_covered;
        const citiesCoveredValue = applicant.cities_covered;

        return {
          ...applicant,
          city: typeof cityValue === "string" ? cityValue : (parsedMeta?.city ?? null),
          years_of_experience:
            typeof yearsOfExperienceValue === "number"
              ? yearsOfExperienceValue
              : (parsedMeta?.years_of_experience ?? null),
          country_covered:
            typeof countryCoveredValue === "string"
              ? countryCoveredValue
              : (parsedMeta?.country_covered ?? null),
          cities_covered: Array.isArray(citiesCoveredValue)
            ? citiesCoveredValue.filter((value): value is string => typeof value === "string")
            : (parsedMeta?.cities_covered ?? null)
        };
      });

      return NextResponse.json({ applicants, totalCount: count || 0 });
    }

    const missingColumn = getMissingSchemaColumn(error.message);
    if (!missingColumn || !OPTIONAL_APPLICATION_COLUMNS.includes(missingColumn)) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    selectColumns = selectColumns.filter((column) => column !== missingColumn);
  }

  return NextResponse.json({ message: "Failed to load applications." }, { status: 500 });
}
