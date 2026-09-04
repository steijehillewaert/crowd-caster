import Link from "next/link";
import Nav from "@/components/nav";
import { prisma } from "@/lib/prisma";
import { createProduction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Productions · Crowd Caster" };

const inputClass =
  "w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-amber-500";

export default async function ProductionsPage() {
  const productions = await prisma.production.findMany({
    orderBy: [{ year: "desc" }, { name: "asc" }],
    include: { _count: { select: { bookings: true } } },
  });

  return (
    <>
      <Nav active="productions" />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <h1 className="mb-5 text-2xl font-semibold text-white">Productions</h1>

        <form
          action={createProduction}
          className="grid gap-2 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:grid-cols-4"
        >
          <input name="name" required placeholder="Production name *" className={inputClass} />
          <input name="client" placeholder="Client" className={inputClass} />
          <input
            name="year"
            type="number"
            min={1900}
            max={2100}
            placeholder="Year"
            className={inputClass}
          />
          <button
            type="submit"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-amber-400"
          >
            Add production
          </button>
        </form>

        {productions.length === 0 ? (
          <p className="mt-8 text-center text-sm text-neutral-500">
            No productions yet. They are also created automatically when you add a
            booking to an extra.
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-neutral-800 rounded-2xl border border-neutral-800 bg-neutral-900">
            {productions.map((production) => (
              <li key={production.id}>
                <Link
                  href={`/productions/${production.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-neutral-800/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {production.name}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {[production.client, production.year].filter(Boolean).join(" · ") ||
                        "—"}
                    </p>
                  </div>
                  <span className="shrink-0 rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">
                    {production._count.bookings} extra
                    {production._count.bookings === 1 ? "" : "s"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
