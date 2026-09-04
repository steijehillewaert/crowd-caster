"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { GENDERS, GENDER_LABELS } from "@/lib/extras";

const inputClass =
  "w-full rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-amber-500";

export default function Filters({
  cities,
  productions,
}: {
  cities: string[];
  productions: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const value = (key: string) => searchParams.get(key) ?? "";
  const hasFilters = Array.from(searchParams.keys()).length > 0;

  function apply(formData: FormData) {
    const next = new URLSearchParams();
    for (const [key, raw] of formData.entries()) {
      const entry = String(raw).trim();
      if (entry) next.set(key, entry);
    }
    const query = next.toString();
    startTransition(() => router.push(query ? `/?${query}` : "/"));
  }

  return (
    <form
      action={apply}
      className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-3"
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <input
          name="q"
          defaultValue={value("q")}
          placeholder="Search name, phone, notes…"
          className={`${inputClass} col-span-2`}
        />
        <select name="gender" defaultValue={value("gender")} className={inputClass}>
          <option value="">Any gender</option>
          {GENDERS.map((gender) => (
            <option key={gender} value={gender}>
              {GENDER_LABELS[gender]}
            </option>
          ))}
        </select>
        <input
          name="city"
          defaultValue={value("city")}
          list="filter-cities"
          placeholder="City"
          className={inputClass}
        />
        <datalist id="filter-cities">
          {cities.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>
        <input
          name="production"
          defaultValue={value("production")}
          list="filter-productions"
          placeholder="Booked on…"
          className={inputClass}
        />
        <datalist id="filter-productions">
          {productions.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <select
          name="availability"
          defaultValue={value("availability")}
          className={inputClass}
        >
          <option value="">Any availability</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <div className="col-span-2 flex items-center gap-1.5 sm:col-span-1">
          <input
            name="minAge"
            type="number"
            min={0}
            max={120}
            defaultValue={value("minAge")}
            placeholder="Age min"
            className={inputClass}
          />
          <span className="text-neutral-600">–</span>
          <input
            name="maxAge"
            type="number"
            min={0}
            max={120}
            defaultValue={value("maxAge")}
            placeholder="max"
            className={inputClass}
          />
        </div>
        <div className="col-span-2 flex items-center gap-1.5 sm:col-span-1">
          <input
            name="minHeight"
            type="number"
            min={80}
            max={250}
            defaultValue={value("minHeight")}
            placeholder="Height min"
            className={inputClass}
          />
          <span className="text-neutral-600">–</span>
          <input
            name="maxHeight"
            type="number"
            min={80}
            max={250}
            defaultValue={value("maxHeight")}
            placeholder="max"
            className={inputClass}
          />
        </div>
        <input
          name="clothingSize"
          defaultValue={value("clothingSize")}
          placeholder="Clothing size"
          className={inputClass}
        />
        <div className="col-span-2 flex gap-2 sm:col-span-1">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-lg bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-white disabled:opacity-60"
          >
            {isPending ? "Filtering…" : "Filter"}
          </button>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => startTransition(() => router.push("/"))}
              className="rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-400 transition hover:text-white"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
