"use client";

import { FormEvent, useState } from "react";
import { POSITION_OPTIONS } from "@/lib/constants";

type FormState = {
  status: "idle" | "submitting" | "success" | "error";
  message?: string;
};

export function ApplicationForm() {
  const [formState, setFormState] = useState<FormState>({ status: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState({ status: "submitting" });

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        body: formData
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setFormState({
          status: "error",
          message: data.message || "Failed to submit application."
        });
        return;
      }

      form.reset();
      setFormState({ status: "success", message: "Application submitted successfully." });
    } catch {
      setFormState({ status: "error", message: "Unexpected error while submitting form." });
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Full Name
          <input
            className="h-11 rounded-lg border border-slate-300 px-3 text-slate-900 outline-none transition focus:border-brand-500"
            name="fullName"
            required
            type="text"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Email
          <input
            className="h-11 rounded-lg border border-slate-300 px-3 text-slate-900 outline-none transition focus:border-brand-500"
            name="email"
            required
            type="email"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Phone
          <input
            className="h-11 rounded-lg border border-slate-300 px-3 text-slate-900 outline-none transition focus:border-brand-500"
            name="phone"
            required
            type="tel"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Position
          <select
            className="h-11 rounded-lg border border-slate-300 px-3 text-slate-900 outline-none transition focus:border-brand-500"
            defaultValue=""
            name="position"
            required
          >
            <option disabled value="">
              Select a position
            </option>
            {POSITION_OPTIONS.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Cover Letter Text (Optional)
        <textarea
          className="min-h-28 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-brand-500"
          name="coverLetter"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Upload CV (PDF, DOC, DOCX, TXT | max 5MB)
        <input
          accept=".pdf,.doc,.docx,.txt"
          className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-slate-900 file:mr-4 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
          name="cv"
          required
          type="file"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Upload Identity Document (National ID Card, or Residence Permit)
        <input
          accept=".pdf,.png,.jpg,.jpeg"
          className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-slate-900 file:mr-4 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
          name="identityDocument"
          required
          type="file"
        />
      </label>

      <button
        className="inline-flex h-11 items-center rounded-lg bg-brand-700 px-5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={formState.status === "submitting"}
        type="submit"
      >
        {formState.status === "submitting" ? "Submitting..." : "Submit Application"}
      </button>

      {formState.message ? (
        <p
          className={`text-sm font-medium ${
            formState.status === "success" ? "text-emerald-700" : "text-rose-700"
          }`}
        >
          {formState.message}
        </p>
      ) : null}
    </form>
  );
}
