import Link from "next/link";

const navItems = [
  { href: "/" as const, label: "Application Form" }
];

export function SiteNav() {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
      <nav className="flex flex-wrap items-center justify-between gap-3">
        <Link className="text-lg font-bold text-slate-900" href="/">
          GTech247
        </Link>
        <div className="flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
          <Link
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            href="/admin"
          >
            Admin
          </Link>
        </div>
      </nav>
    </header>
  );
}
