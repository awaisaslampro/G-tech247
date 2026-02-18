import { ApplicationForm } from "@/components/application-form";
import Image from "next/image";

export default function ApplicationPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col items-start">
            <Image
              src="/logo.png"
              alt="Gtech247 Logo"
              width={160}
              height={160}
              className="mt-2 h-auto w-40 sm:w-52 md:w-64"
            />
            <h1 className="mt-2 text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
              Job Application Form
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600 text-sm sm:text-base">
              Apply for a role at Gtech247 by filling your details and uploading
              your CV and identity document.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <ApplicationForm />
      </section>
    </main>
  );
}
