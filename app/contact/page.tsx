import { SiteNav } from "@/components/site-nav";

export default function ContactPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
      <SiteNav />

      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Contact</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Let&apos;s Talk</h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          Reach out for partnerships, project inquiries, or general questions. We usually respond within 1-2 business
          days.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Company Info</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Email: hello@gtech247.com</li>
            <li>Phone: +1 (000) 000-0000</li>
            <li>Address: 123 Business Ave, Tech City, USA</li>
          </ul>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Working Hours</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Monday - Friday: 9:00 AM - 6:00 PM</li>
            <li>Saturday: 10:00 AM - 2:00 PM</li>
            <li>Sunday: Closed</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
