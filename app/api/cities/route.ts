import { NextResponse } from "next/server";
import {
  CITIES_BY_COUNTRY,
  CityCoverageOption,
  COUNTRY_COVERAGE_OPTIONS,
  CountryCoverageOption
} from "@/lib/constants";

type CountriesNowResponse = {
  error?: boolean;
  msg?: string;
  data?: unknown;
};

function isCountryCoverageOption(value: string): value is CountryCoverageOption {
  return COUNTRY_COVERAGE_OPTIONS.includes(value as CountryCoverageOption);
}

function normalizeCityNames(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const uniqueNames = new Set<string>();
  for (const item of value) {
    const cityName = String(item || "").trim();
    if (cityName) {
      uniqueNames.add(cityName);
    }
  }

  return Array.from(uniqueNames).sort((first, second) => first.localeCompare(second));
}

function mergeCitiesWithCoordinates(
  cityNames: string[],
  fallbackCities: CityCoverageOption[]
): CityCoverageOption[] {
  const fallbackCityMap = new Map(
    fallbackCities.map((city) => [city.name.toLowerCase(), city] as const)
  );

  return cityNames.map((cityName) => {
    const mappedCity = fallbackCityMap.get(cityName.toLowerCase());
    if (mappedCity) {
      return mappedCity;
    }

    return { name: cityName };
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country")?.trim() || "";

  if (!country) {
    return NextResponse.json({ message: "Country is required." }, { status: 400 });
  }

  if (!isCountryCoverageOption(country)) {
    return NextResponse.json({ message: "Invalid country." }, { status: 400 });
  }

  const fallbackCities = CITIES_BY_COUNTRY[country] || [];

  try {
    const response = await fetch("https://countriesnow.space/api/v0.1/countries/cities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ country }),
      cache: "no-store"
    });

    if (!response.ok) {
      return NextResponse.json({ cities: fallbackCities, source: "fallback" });
    }

    const payload = (await response.json()) as CountriesNowResponse;
    if (payload.error) {
      return NextResponse.json({ cities: fallbackCities, source: "fallback" });
    }

    const cityNames = normalizeCityNames(payload.data);
    if (cityNames.length === 0) {
      return NextResponse.json({ cities: fallbackCities, source: "fallback" });
    }

    const cities = mergeCitiesWithCoordinates(cityNames, fallbackCities);
    return NextResponse.json({ cities, source: "remote" });
  } catch {
    return NextResponse.json({ cities: fallbackCities, source: "fallback" });
  }
}
