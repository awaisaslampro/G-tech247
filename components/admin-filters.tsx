"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type AdminFiltersProps = {
  initialQuery: string;
  initialCity: string;
  cityOptions: string[];
};

export function AdminFilters({ initialQuery, initialCity, cityOptions }: AdminFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  function replaceWithParams(nextParams: URLSearchParams) {
    const queryString = nextParams.toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
    startTransition(() => {
      router.replace(nextUrl);
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextParams = new URLSearchParams(searchParams.toString());
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      nextParams.set("q", trimmedQuery);
    } else {
      nextParams.delete("q");
    }

    replaceWithParams(nextParams);
  }

  function handleCityChange(nextCity: string) {
    const nextParams = new URLSearchParams(searchParams.toString());
    const trimmedCity = nextCity.trim();

    if (trimmedCity) {
      nextParams.set("city", trimmedCity);
    } else {
      nextParams.delete("city");
    }

    replaceWithParams(nextParams);
  }

  return (
    <form className="grid gap-4 sm:grid-cols-[1fr_220px_auto]" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Search by Name or Email
        <input
          className="h-11 rounded-lg border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand-500"
          name="q"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="e.g. ali@example.com"
          type="text"
          value={query}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Filter by City
        <select
          className="h-11 rounded-lg border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand-500"
          defaultValue={initialCity}
          disabled={isPending}
          name="city"
          onChange={(event) => handleCityChange(event.target.value)}
        >
          <option value="">All cities</option>
          {cityOptions.map((cityOption) => (
            <option key={cityOption} value={cityOption}>
              {cityOption}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end gap-2">
        <button
          className="inline-flex h-11 items-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isPending}
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
  );
}
