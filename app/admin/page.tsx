import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { AdminFilters } from "@/components/admin-filters";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { ApplicationRow } from "@/lib/types";

type AdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function normalizeParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
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
  certifications?: string[] | null;
  certification?: string | null;
  years_of_experience?: number | null;
  country_covered?: string | null;
  cities_covered?: string[] | null;
};

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
    const parsedCertifications = parsed.certifications;

    return {
      city: typeof parsed.city === "string" ? parsed.city : undefined,
      certifications: Array.isArray(parsedCertifications)
        ? parsedCertifications.filter((value): value is string => typeof value === "string")
        : null,
      certification: typeof parsed.certification === "string" ? parsed.certification : null,
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
  "certifications",
  "certification",
  "years_of_experience",
  "country_covered",
  "cities_covered"
];

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const isAllowed = await isAdminAuthenticated();
  if (!isAllowed) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const q = normalizeParam(params.q).trim();
  const selectedCity = normalizeParam(params.city).trim();
  const cityFilter = selectedCity.toLowerCase();

  const supabase = getServiceSupabaseClient();
  let selectColumns = [...BASE_APPLICATION_SELECT_COLUMNS, ...OPTIONAL_APPLICATION_COLUMNS];
  let applicants: ApplicationRow[] = [];
  let cityOptions: string[] = [];
  let totalCount = 0;
  let loaded = false;

  for (let attempt = 0; attempt <= OPTIONAL_APPLICATION_COLUMNS.length; attempt += 1) {
    let query = supabase
      .from("applications")
      .select(selectColumns.join(", "), {
        count: "exact"
      })
      .order("created_at", { ascending: false });

    if (q) {
      query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
    }

    const { data, error, count } = await query;
    if (!error) {
      const rows = (data || []) as unknown as Array<Record<string, unknown>>;
      applicants = rows.map((applicant) => {
        const parsedMeta = parseMetaFromCoverLetter(applicant.cover_letter);
        const certificationsValue = applicant.certifications;
        const certificationValue = applicant.certification;
        const citiesCoveredValue = applicant.cities_covered;
        const normalizedCertifications = Array.isArray(certificationsValue)
          ? certificationsValue.filter((value): value is string => typeof value === "string")
          : parsedMeta?.certifications ??
            (typeof certificationValue === "string"
              ? [certificationValue]
              : parsedMeta?.certification
                ? [parsedMeta.certification]
                : null);
        const normalizedPrimaryCertification =
          normalizedCertifications && normalizedCertifications.length > 0
            ? normalizedCertifications[0]
            : typeof certificationValue === "string"
              ? certificationValue
              : (parsedMeta?.certification ?? null);

        return {
          id: String(applicant.id || ""),
          full_name: String(applicant.full_name || ""),
          email: String(applicant.email || ""),
          phone: String(applicant.phone || ""),
          city: typeof applicant.city === "string" ? applicant.city : (parsedMeta?.city ?? null),
          certifications: normalizedCertifications,
          certification: normalizedPrimaryCertification,
          years_of_experience:
            typeof applicant.years_of_experience === "number"
              ? applicant.years_of_experience
              : (parsedMeta?.years_of_experience ?? null),
          country_covered:
            typeof applicant.country_covered === "string"
              ? applicant.country_covered
              : (parsedMeta?.country_covered ?? null),
          cities_covered: Array.isArray(citiesCoveredValue)
            ? citiesCoveredValue.filter((value): value is string => typeof value === "string")
            : (parsedMeta?.cities_covered ?? null),
          position: String(applicant.position || ""),
          cover_letter: typeof applicant.cover_letter === "string" ? applicant.cover_letter : null,
          cv_path: String(applicant.cv_path || ""),
          cv_file_name: String(applicant.cv_file_name || ""),
          identity_document_path:
            typeof applicant.identity_document_path === "string"
              ? applicant.identity_document_path
              : null,
          identity_document_file_name:
            typeof applicant.identity_document_file_name === "string"
              ? applicant.identity_document_file_name
              : null,
          created_at: String(applicant.created_at || "")
        };
      });

      const uniqueCities = new Set<string>();
      for (const applicant of applicants) {
        const candidateCity = (applicant.city || "").trim();
        if (candidateCity) {
          uniqueCities.add(candidateCity);
        }
      }
      cityOptions = Array.from(uniqueCities).sort((first, second) => first.localeCompare(second));
      if (selectedCity && !cityOptions.some((city) => city.toLowerCase() === cityFilter)) {
        cityOptions = [...cityOptions, selectedCity].sort((first, second) =>
          first.localeCompare(second)
        );
      }

      if (cityFilter) {
        applicants = applicants.filter((applicant) => (applicant.city || "").toLowerCase() === cityFilter);
      }
      totalCount = cityFilter ? applicants.length : count || 0;
      loaded = true;
      break;
    }

    const missingColumn = getMissingSchemaColumn(error.message);
    if (!missingColumn || !OPTIONAL_APPLICATION_COLUMNS.includes(missingColumn)) {
      throw new Error(`Failed to load applications: ${error.message}`);
    }

    selectColumns = selectColumns.filter((column) => column !== missingColumn);
  }

  if (!loaded) {
    throw new Error("Failed to load applications.");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Portal</h1>
            <p className="mt-1 text-slate-600">Track all applications and download submitted files.</p>
          </div>
          <AdminLogoutButton />
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Applicants</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totalCount}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <AdminFilters cityOptions={cityOptions} initialCity={selectedCity} initialQuery={q} />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Applicant
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  City
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Certifications
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Submitted
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Documents
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applicants.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={6}>
                    No applicants found for your current filter.
                  </td>
                </tr>
              ) : (
                applicants.map((applicant) => (
                  <tr key={applicant.id}>
                    <td className="px-4 py-4 text-sm">
                      <p className="font-semibold text-slate-900">{applicant.full_name}</p>
                      <p className="text-slate-600">{applicant.email}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">{applicant.city || "N/A"}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {applicant.certifications && applicant.certifications.length > 0
                        ? applicant.certifications.join(", ")
                        : (applicant.certification || "N/A")}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {applicant.phone}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {new Date(applicant.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          className="inline-flex h-9 items-center rounded-lg bg-brand-700 px-3 text-xs font-semibold text-white transition hover:bg-brand-800"
                          href={`/api/applications/${applicant.id}/files/cv`}
                        >
                          CV
                        </Link>
                        {applicant.identity_document_path ? (
                          <Link
                            className="inline-flex h-9 items-center rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            href={`/api/applications/${applicant.id}/files/identity-document`}
                          >
                            Identity
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
