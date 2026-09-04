import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Nav from "@/components/nav";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/extras";
import { deleteProduction } from "../actions";

export const dynamic = "force-dynamic";

export default async function ProductionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const production = await prisma.production.findUnique({
    where: { id },
    include: {
      bookings: {
        include: {
          extra: {
            include: { photos: { where: { isPrimary: true }, take: 1 } },
          },
        },
        orderBy: [{ date: "desc" }],
      },
    },
  });

  if (!production) notFound();

  const dateFormat = new Intl.DateTimeFormat("nl-BE", { dateStyle: "medium" });
  const totalFee = production.bookings.reduce(
    (sum, booking) => sum + (booking.feeEur ? Number(booking.feeEur) : 0),
    0,
  );

  return (
    <>
      <Nav active="productions" />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link
              href="/productions"
              className="text-sm text-neutral-500 hover:text-white"
            >
              ← All productions
            </Link>
            <h1 className="mt-1 text-2xl font-semibold text-white">
              {production.name}
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              {[
                production.client,
                production.year,
                `${production.bookings.length} extra${production.bookings.length === 1 ? "" : "s"}`,
                totalFee > 0 ? `${formatMoney(totalFee)} total fees` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <form action={deleteProduction}>
            <input type="hidden" name="id" value={production.id} />
            <button
              type="submit"
              className="rounded-lg border border-red-900/60 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
            >
              Delete
            </button>
          </form>
        </div>

        {production.notes ? (
          <p className="mb-4 whitespace-pre-wrap rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-200">
            {production.notes}
          </p>
        ) : null}

        {production.bookings.length === 0 ? (
          <p className="mt-8 text-center text-sm text-neutral-500">
            No extras booked on this production yet.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-800 rounded-2xl border border-neutral-800 bg-neutral-900">
            {production.bookings.map((booking) => (
              <li key={booking.id}>
                <Link
                  href={`/extras/${booking.extraId}`}
                  className="flex items-center gap-3 px-4 py-3 transition hover:bg-neutral-800/50"
                >
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                    {booking.extra.photos[0] ? (
                      <Image
                        src={booking.extra.photos[0].url}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {booking.extra.firstName} {booking.extra.lastName}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {[
                        booking.role,
                        booking.date ? dateFormat.format(booking.date) : null,
                        formatMoney(booking.feeEur),
                      ]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
