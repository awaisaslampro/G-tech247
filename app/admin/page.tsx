import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { POSITION_OPTIONS } from "@/lib/constants";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { ApplicationRow } from "@/lib/types";

type AdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function normalizeParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const isAllowed = await isAdminAuthenticated();
  if (!isAllowed) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const q = normalizeParam(params.q).trim();
  const position = normalizeParam(params.position).trim();

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
    throw new Error(`Failed to load applications: ${error.message}`);
  }

  const applicants = (data || []) as ApplicationRow[];
  const totalCount = count || 0;

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
        <form className="grid gap-4 sm:grid-cols-[1fr_220px_auto]">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Search by Name or Email
            <input
              className="h-11 rounded-lg border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand-500"
              defaultValue={q}
              name="q"
              placeholder="e.g. ali@example.com"
              type="text"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Filter by Position
            <select
              className="h-11 rounded-lg border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand-500"
              defaultValue={position}
              name="position"
            >
              <option value="">All positions</option>
              {POSITION_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button
              className="inline-flex h-11 items-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
              type="submit"
            >
              Apply
            </button>
            <Link
              className="inline-flex h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              href="/admin"
            >
              Reset
            </Link>
          </div>
        </form>
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
                  Position
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
                  <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={5}>
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
                    <td className="px-4 py-4 text-sm text-slate-700">{applicant.position}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{applicant.phone}</td>
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
