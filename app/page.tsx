import { ApplicationForm } from "@/components/application-form";

export default function ApplicationPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Gtech247</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Job Application Form</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Apply for a role at Gtech247 by filling your details and uploading your CV and identity document.
            </p>
          </div>
          <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Logo</p>
            <p className="mt-1 text-xl font-bold text-brand-800">Gtech247</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <ApplicationForm />
      </section>
    </main>
  );
}
