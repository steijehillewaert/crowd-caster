import Link from "next/link";
import Image from "next/image";
import { GENDER_LABELS, ageFrom, formatMoney, type GenderValue } from "@/lib/extras";

export type ExtraCardData = {
  id: string;
  firstName: string;
  lastName: string;
  gender: GenderValue | null;
  dateOfBirth: Date | null;
  city: string | null;
  heightCm: number | null;
  clothingSize: string | null;
  available: boolean;
  dayRateEur: number | null;
  photoUrl: string | null;
  bookingCount: number;
  recentProductions: string[];
};

export default function ExtraCard({ extra }: { extra: ExtraCardData }) {
  const age = ageFrom(extra.dateOfBirth);
  const facts = [
    age !== null ? `${age} yrs` : null,
    extra.gender ? GENDER_LABELS[extra.gender] : null,
    extra.heightCm ? `${extra.heightCm} cm` : null,
    extra.clothingSize,
  ].filter(Boolean);

  return (
    <li>
      <Link
        href={`/extras/${extra.id}`}
        className="group block overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition hover:border-neutral-600"
      >
        <div className="relative aspect-[3/4] bg-neutral-800">
          {extra.photoUrl ? (
            <Image
              src={extra.photoUrl}
              alt={`${extra.firstName} ${extra.lastName}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition group-hover:opacity-90"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl font-semibold text-neutral-700">
              {extra.firstName[0]}
              {extra.lastName[0]}
            </div>
          )}
          {!extra.available ? (
            <span className="absolute left-2 top-2 rounded-md bg-neutral-950/80 px-2 py-0.5 text-[11px] font-medium text-neutral-300">
              Unavailable
            </span>
          ) : null}
        </div>
        <div className="p-3">
          <p className="truncate text-sm font-semibold text-white">
            {extra.firstName} {extra.lastName}
          </p>
          <p className="mt-0.5 truncate text-xs text-neutral-400">
            {facts.length > 0 ? facts.join(" · ") : "No details yet"}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
            {extra.city ? (
              <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-neutral-300">
                {extra.city}
              </span>
            ) : null}
            {extra.dayRateEur !== null ? (
              <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-neutral-300">
                {formatMoney(extra.dayRateEur)}/day
              </span>
            ) : null}
            {extra.bookingCount > 0 ? (
              <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-400">
                {extra.bookingCount} booking{extra.bookingCount === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
          {extra.recentProductions.length > 0 ? (
            <p className="mt-1.5 truncate text-[11px] text-neutral-500">
              {extra.recentProductions.join(", ")}
            </p>
          ) : null}
        </div>
      </Link>
    </li>
  );
}
