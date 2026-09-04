import Link from "next/link";
import type { Prisma } from "@prisma/client";
import Nav from "@/components/nav";
import Filters from "@/components/filters";
import ExtraCard from "@/components/extra-card";
import { prisma } from "@/lib/prisma";
import { GENDERS, type GenderValue } from "@/lib/extras";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function one(params: SearchParams, key: string): string {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function num(params: SearchParams, key: string): number | null {
  const value = Number(one(params, key));
  return Number.isFinite(value) && one(params, key) !== "" ? value : null;
}

/** Someone is at most `age` until their next birthday, so map ages to a DOB window. */
function dobRange(minAge: number | null, maxAge: number | null) {
  const now = new Date();
  const range: { gte?: Date; lte?: Date } = {};
  if (minAge !== null) {
    range.lte = new Date(
      Date.UTC(now.getUTCFullYear() - minAge, now.getUTCMonth(), now.getUTCDate()),
    );
  }
  if (maxAge !== null) {
    range.gte = new Date(
      Date.UTC(
        now.getUTCFullYear() - maxAge - 1,
        now.getUTCMonth(),
        now.getUTCDate() + 1,
      ),
    );
  }
  return Object.keys(range).length > 0 ? range : undefined;
}

export default async function ExtrasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const q = one(params, "q");
  const gender = one(params, "gender");
  const city = one(params, "city");
  const clothingSize = one(params, "clothingSize");
  const production = one(params, "production");
  const availability = one(params, "availability");
  const minAge = num(params, "minAge");
  const maxAge = num(params, "maxAge");
  const minHeight = num(params, "minHeight");
  const maxHeight = num(params, "maxHeight");

  const where: Prisma.ExtraWhereInput = {};
  const and: Prisma.ExtraWhereInput[] = [];

  if (q) {
    and.push({
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (gender && GENDERS.includes(gender as GenderValue)) {
    and.push({ gender: gender as GenderValue });
  }
  if (city) and.push({ city: { contains: city, mode: "insensitive" } });
  if (clothingSize) {
    and.push({ clothingSize: { equals: clothingSize, mode: "insensitive" } });
  }
  if (availability === "available") and.push({ available: true });
  if (availability === "unavailable") and.push({ available: false });

  const dob = dobRange(minAge, maxAge);
  if (dob) and.push({ dateOfBirth: dob });

  if (minHeight !== null || maxHeight !== null) {
    and.push({
      heightCm: {
        ...(minHeight !== null ? { gte: minHeight } : {}),
        ...(maxHeight !== null ? { lte: maxHeight } : {}),
      },
    });
  }
  if (production) {
    and.push({
      bookings: {
        some: {
          production: { name: { contains: production, mode: "insensitive" } },
        },
      },
    });
  }
  if (and.length > 0) where.AND = and;

  const [extras, total, cities, productions] = await Promise.all([
    prisma.extra.findMany({
      where,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      take: 200,
      include: {
        photos: { where: { isPrimary: true }, take: 1 },
        bookings: {
          include: { production: { select: { name: true } } },
          orderBy: { date: "desc" },
          take: 3,
        },
        _count: { select: { bookings: true, photos: true } },
      },
    }),
    prisma.extra.count(),
    prisma.extra.findMany({
      where: { city: { not: null } },
      distinct: ["city"],
      select: { city: true },
      orderBy: { city: "asc" },
    }),
    prisma.production.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
      take: 200,
    }),
  ]);

  return (
    <>
      <Nav active="extras" />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-semibold text-white">Extras</h1>
          <p className="text-sm text-neutral-500">
            {extras.length === total
              ? `${total} in the catalogue`
              : `${extras.length} of ${total} shown`}
          </p>
        </div>

        <Filters
          cities={cities.map((row) => row.city).filter((c): c is string => Boolean(c))}
          productions={productions.map((row) => row.name)}
        />

        {extras.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-neutral-800 p-12 text-center">
            <p className="text-neutral-400">
              {total === 0
                ? "No extras yet."
                : "No extras match these filters."}
            </p>
            <Link
              href="/extras/new"
              className="mt-4 inline-block rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-amber-400"
            >
              Add the first extra
            </Link>
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {extras.map((extra) => (
              <ExtraCard
                key={extra.id}
                extra={{
                  id: extra.id,
                  firstName: extra.firstName,
                  lastName: extra.lastName,
                  gender: extra.gender,
                  dateOfBirth: extra.dateOfBirth,
                  city: extra.city,
                  heightCm: extra.heightCm,
                  clothingSize: extra.clothingSize,
                  available: extra.available,
                  dayRateEur: extra.dayRateEur ? Number(extra.dayRateEur) : null,
                  photoUrl: extra.photos[0]?.url ?? null,
                  bookingCount: extra._count.bookings,
                  recentProductions: extra.bookings.map((b) => b.production.name),
                }}
              />
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
