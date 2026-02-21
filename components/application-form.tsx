"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  CERTIFICATION_OPTIONS,
  CITIES_BY_COUNTRY,
  CityCoverageOption,
  CITY_PROXIMITY_KM,
  CertificationOption,
  COUNTRY_COVERAGE_OPTIONS,
  CountryCoverageOption,
  POSITION_OPTIONS,
} from "@/lib/constants";

type FormState = {
  status: "idle" | "submitting" | "success" | "error";
  message?: string;
};

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function distanceInKm(
  first: { lat: number; lng: number },
  second: { lat: number; lng: number },
): number {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(second.lat - first.lat);
  const deltaLng = toRadians(second.lng - first.lng);
  const lat1 = toRadians(first.lat);
  const lat2 = toRadians(second.lat);

  const haversine =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2) *
      Math.cos(lat1) *
      Math.cos(lat2);

  return (
    2 *
    earthRadiusKm *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

export function ApplicationForm() {
  const [formState, setFormState] = useState<FormState>({ status: "idle" });
  const [selectedCertification, setSelectedCertification] = useState<
    CertificationOption | ""
  >("");
  const [certifications, setCertifications] = useState<CertificationOption[]>(
    [],
  );
  const [countryCovered, setCountryCovered] = useState<
    CountryCoverageOption | ""
  >("");
  const [countryCities, setCountryCities] = useState<CityCoverageOption[]>([]);
  const [isLoadingCountryCities, setIsLoadingCountryCities] = useState(false);
  const [citiesLoadError, setCitiesLoadError] = useState<string | null>(null);
  const [citySearch, setCitySearch] = useState("");
  const [selectedCityForCoverage, setSelectedCityForCoverage] = useState("");
  const [citiesCovered, setCitiesCovered] = useState<string[]>([]);

  const blockedCityNames = useMemo(() => {
    if (!countryCovered || citiesCovered.length === 0) {
      return new Set<string>();
    }

    const cityMap = new Map(countryCities.map((city) => [city.name, city]));
    const selectedCitiesWithCoordinates = citiesCovered
      .map((cityName) => cityMap.get(cityName))
      .filter(
        (
          city,
        ): city is {
          name: string;
          lat: number;
          lng: number;
        } =>
          Boolean(
            city &&
            typeof city.lat === "number" &&
            typeof city.lng === "number",
          ),
      );
    const blocked = new Set<string>();

    for (const city of countryCities) {
      if (typeof city.lat !== "number" || typeof city.lng !== "number") {
        continue;
      }

      for (const selectedCity of selectedCitiesWithCoordinates) {
        if (city.name === selectedCity.name) {
          continue;
        }

        if (
          distanceInKm({ lat: city.lat, lng: city.lng }, selectedCity) <=
          CITY_PROXIMITY_KM
        ) {
          blocked.add(city.name);
          break;
        }
      }
    }

    return blocked;
  }, [citiesCovered, countryCities, countryCovered]);

  const availableCoverageCities = useMemo(() => {
    const normalizedSearch = citySearch.trim().toLowerCase();

    return countryCities.filter((city) => {
      if (citiesCovered.includes(city.name)) {
        return false;
      }

      if (blockedCityNames.has(city.name)) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return city.name.toLowerCase().includes(normalizedSearch);
    });
  }, [blockedCityNames, citiesCovered, citySearch, countryCities]);

  const availableCertifications = useMemo(
    () =>
      CERTIFICATION_OPTIONS.filter(
        (certification) => !certifications.includes(certification),
      ),
    [certifications],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadCountryCities() {
      if (!countryCovered) {
        setCountryCities([]);
        setIsLoadingCountryCities(false);
        setCitiesLoadError(null);
        return;
      }

      setIsLoadingCountryCities(true);
      setCitiesLoadError(null);

      try {
        const response = await fetch(
          `/api/cities?country=${encodeURIComponent(countryCovered)}`,
          { method: "GET" },
        );
        const payload = (await response.json()) as {
          cities?: CityCoverageOption[];
          message?: string;
          source?: "remote" | "fallback";
        };

        if (!response.ok || !Array.isArray(payload.cities)) {
          throw new Error(payload.message || "Failed to load cities.");
        }

        if (cancelled) {
          return;
        }

        setCountryCities(payload.cities);
        if (payload.source === "fallback") {
          setCitiesLoadError("Showing fallback city list for this country.");
        }
      } catch {
        if (cancelled) {
          return;
        }

        setCountryCities(CITIES_BY_COUNTRY[countryCovered] || []);
        setCitiesLoadError("Could not load full city list right now.");
      } finally {
        if (!cancelled) {
          setIsLoadingCountryCities(false);
        }
      }
    }

    void loadCountryCities();

    return () => {
      cancelled = true;
    };
  }, [countryCovered]);

  useEffect(() => {
    if (availableCoverageCities.length === 0) {
      setSelectedCityForCoverage("");
      return;
    }

    const cityExists = availableCoverageCities.some(
      (city) => city.name === selectedCityForCoverage,
    );
    if (!cityExists) {
      setSelectedCityForCoverage(availableCoverageCities[0].name);
    }
  }, [availableCoverageCities, selectedCityForCoverage]);

  useEffect(() => {
    if (availableCertifications.length === 0) {
      setSelectedCertification("");
      return;
    }

    const certificationExists =
      selectedCertification !== "" &&
      availableCertifications.includes(selectedCertification);
    if (!certificationExists) {
      setSelectedCertification(availableCertifications[0]);
    }
  }, [availableCertifications, selectedCertification]);

  function handleCountryCoveredChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextCountry = event.target.value as CountryCoverageOption | "";
    setCountryCovered(nextCountry);
    setCitySearch("");
    setSelectedCityForCoverage("");
    setCitiesCovered([]);
    setCountryCities([]);
    setCitiesLoadError(null);
    setIsLoadingCountryCities(false);
  }

  function addCoveredCity() {
    if (!selectedCityForCoverage) {
      return;
    }

    setCitiesCovered((previous) => {
      if (previous.includes(selectedCityForCoverage)) {
        return previous;
      }
      return [...previous, selectedCityForCoverage];
    });
  }

  function addCertification() {
    if (!selectedCertification) {
      return;
    }

    setCertifications((previous) => {
      if (previous.includes(selectedCertification)) {
        return previous;
      }

      return [...previous, selectedCertification];
    });
  }

  function removeCertification(certificationName: CertificationOption) {
    setCertifications((previous) =>
      previous.filter((item) => item !== certificationName),
    );
  }

  function removeCoveredCity(cityName: string) {
    setCitiesCovered((previous) =>
      previous.filter((item) => item !== cityName),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState({ status: "submitting" });

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setFormState({
          status: "error",
          message: data.message || "Failed to submit application.",
        });
        return;
      }

      form.reset();
      setSelectedCertification("");
      setCertifications([]);
      setCountryCovered("");
      setCitySearch("");
      setSelectedCityForCoverage("");
      setCitiesCovered([]);
      setCountryCities([]);
      setCitiesLoadError(null);
      setIsLoadingCountryCities(false);
      setFormState({
        status: "success",
        message: "Application submitted successfully.",
      });
    } catch {
      setFormState({
        status: "error",
        message: "Unexpected error while submitting form.",
      });
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
          City
          <input
            className="h-11 rounded-lg border border-slate-300 px-3 text-slate-900 outline-none transition focus:border-brand-500"
            name="city"
            required
            type="text"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Years of Experience (Optional)
          <input
            className="h-11 rounded-lg border border-slate-300 px-3 text-slate-900 outline-none transition focus:border-brand-500"
            min={0}
            name="yearsOfExperience"
            step="0.5"
            type="number"
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

        <div className="space-y-2 sm:col-span-2">
          <p className="text-sm font-medium text-slate-700">
            Certifications (Optional)
          </p>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <select
              className="h-11 rounded-lg border border-slate-300 px-3 text-slate-900 outline-none transition focus:border-brand-500"
              onChange={(event) =>
                setSelectedCertification(
                  event.target.value as CertificationOption | "",
                )
              }
              value={selectedCertification}
            >
              {availableCertifications.length === 0 ? (
                <option value="">No certifications available</option>
              ) : (
                availableCertifications.map((certification) => (
                  <option key={certification} value={certification}>
                    {certification}
                  </option>
                ))
              )}
            </select>
            <button
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!selectedCertification}
              onClick={addCertification}
              type="button"
            >
              Add Certification
            </button>
          </div>
          {certifications.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {certifications.map((certificationName) => (
                <div
                  key={certificationName}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-800"
                >
                  <span>{certificationName}</span>
                  <button
                    className="text-brand-900 transition hover:text-brand-700"
                    onClick={() => removeCertification(certificationName)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              No certification selected yet.
            </p>
          )}
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Countries can Cover (Optional)
          <select
            className="h-11 rounded-lg border border-slate-300 px-3 text-slate-900 outline-none transition focus:border-brand-500"
            name="countryCovered"
            onChange={handleCountryCoveredChange}
            value={countryCovered}
          >
            <option value="">Select a country</option>
            {COUNTRY_COVERAGE_OPTIONS.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>
      </div>

      {countryCovered ? (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">
            Cities can Cover (Optional)
          </p>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input
              className="h-11 rounded-lg border border-slate-300 px-3 text-slate-900 outline-none transition focus:border-brand-500"
              onChange={(event) => setCitySearch(event.target.value)}
              placeholder={`Search ${countryCovered} cities`}
              type="search"
              value={citySearch}
            />
            <select
              className="h-11 rounded-lg border border-slate-300 px-3 text-slate-900 outline-none transition focus:border-brand-500"
              disabled={isLoadingCountryCities}
              onChange={(event) =>
                setSelectedCityForCoverage(event.target.value)
              }
              value={selectedCityForCoverage}
            >
              {isLoadingCountryCities ? (
                <option value="">Loading cities...</option>
              ) : availableCoverageCities.length === 0 ? (
                <option value="">No cities available</option>
              ) : (
                availableCoverageCities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))
              )}
            </select>
            <button
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!selectedCityForCoverage || isLoadingCountryCities}
              onClick={addCoveredCity}
              type="button"
            >
              Add City
            </button>
          </div>
          {citiesLoadError ? (
            <p className="text-xs text-amber-700">{citiesLoadError}</p>
          ) : null}

          {citiesCovered.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {citiesCovered.map((cityName) => (
                <div
                  key={cityName}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-800"
                >
                  <span>{cityName}</span>
                  <button
                    className="text-brand-900 transition hover:text-brand-700"
                    onClick={() => removeCoveredCity(cityName)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No city selected yet.</p>
          )}
        </div>
      ) : null}

      {citiesCovered.map((cityName) => (
        <input
          key={cityName}
          name="citiesCovered"
          type="hidden"
          value={cityName}
        />
      ))}

      {certifications.map((certificationName) => (
        <input
          key={certificationName}
          name="certifications"
          type="hidden"
          value={certificationName}
        />
      ))}

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
        {formState.status === "submitting"
          ? "Submitting..."
          : "Submit Application"}
      </button>

      {formState.message ? (
        <p
          className={`text-sm font-medium ${
            formState.status === "success"
              ? "text-emerald-700"
              : "text-rose-700"
          }`}
        >
          {formState.message}
        </p>
      ) : null}
    </form>
  );
}
