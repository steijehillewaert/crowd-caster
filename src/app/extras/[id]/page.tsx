import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Nav from "@/components/nav";
import PhotoUploader from "@/components/photo-uploader";
import { prisma } from "@/lib/prisma";
import { GENDER_LABELS, ageFrom, formatMoney } from "@/lib/extras";
import {
  addBooking,
  deleteBooking,
  deleteExtra,
  deletePhoto,
  setPrimaryPhoto,
} from "../actions";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-amber-500";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex justify-between gap-4 border-b border-neutral-800/70 py-2 text-sm last:border-0">
      <span className="text-neutral-500">{label}</span>
      <span className="text-right text-neutral-100">{value}</span>
    </div>
  );
}

function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default async function ExtraDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [extra, productions] = await Promise.all([
    prisma.extra.findUnique({
      where: { id },
      include: {
        photos: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
        bookings: {
          include: { production: true },
          orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        },
      },
    }),
    prisma.production.findMany({ orderBy: { name: "asc" }, take: 300 }),
  ]);

  if (!extra) notFound();

  const age = ageFrom(extra.dateOfBirth);
  const dateFormat = new Intl.DateTimeFormat("nl-BE", { dateStyle: "medium" });

  return (
    <>
      <Nav active="extras" />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link href="/" className="text-sm text-neutral-500 hover:text-white">
              ← All extras
            </Link>
            <h1 className="mt-1 text-2xl font-semibold text-white">
              {extra.firstName} {extra.lastName}
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              {[
                age !== null ? `${age} years` : null,
                extra.gender ? GENDER_LABELS[extra.gender] : null,
                extra.city,
                extra.available ? "Available" : "Unavailable",
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/extras/${extra.id}/edit`}
              className="rounded-lg bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-white"
            >
              Edit
            </Link>
            <form action={deleteExtra}>
              <input type="hidden" name="id" value={extra.id} />
              <button
                type="submit"
                className="rounded-lg border border-red-900/60 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
              >
                Delete
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Panel
              title={`Photos (${extra.photos.length})`}
              action={<PhotoUploader extraId={extra.id} />}
            >
              {extra.photos.length === 0 ? (
                <p className="py-6 text-center text-sm text-neutral-500">
                  No photos yet.
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {extra.photos.map((photo) => (
                    <li
                      key={photo.id}
                      className="group relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-800"
                    >
                      <div className="relative aspect-[3/4]">
                        <Image
                          src={photo.url}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover"
                        />
                      </div>
                      {photo.isPrimary ? (
                        <span className="absolute left-1.5 top-1.5 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-950">
                          Cover
                        </span>
                      ) : null}
                      <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-neutral-950/85 p-1.5 opacity-0 transition group-hover:opacity-100">
                        {!photo.isPrimary ? (
                          <form action={setPrimaryPhoto} className="flex-1">
                            <input type="hidden" name="photoId" value={photo.id} />
                            <button
                              type="submit"
                              className="w-full rounded px-1.5 py-1 text-[11px] text-neutral-300 hover:text-white"
                            >
                              Make cover
                            </button>
                          </form>
                        ) : null}
                        <form action={deletePhoto} className="flex-1">
                          <input type="hidden" name="photoId" value={photo.id} />
                          <button
                            type="submit"
                            className="w-full rounded px-1.5 py-1 text-[11px] text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title={`Booked productions (${extra.bookings.length})`}>
              {extra.bookings.length === 0 ? (
                <p className="py-4 text-sm text-neutral-500">
                  No bookings recorded yet.
                </p>
              ) : (
                <ul className="divide-y divide-neutral-800">
                  {extra.bookings.map((booking) => (
                    <li
                      key={booking.id}
                      className="flex items-center justify-between gap-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/productions/${booking.productionId}`}
                          className="truncate text-sm font-medium text-white hover:text-amber-400"
                        >
                          {booking.production.name}
                        </Link>
                        <p className="truncate text-xs text-neutral-500">
                          {[
                            booking.role,
                            booking.date ? dateFormat.format(booking.date) : null,
                            formatMoney(booking.feeEur),
                            booking.notes,
                          ]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </p>
                      </div>
                      <form action={deleteBooking}>
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <button
                          type="submit"
                          className="text-xs text-neutral-600 transition hover:text-red-400"
                        >
                          Remove
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}

              <form
                action={addBooking}
                className="mt-4 grid gap-2 border-t border-neutral-800 pt-4 sm:grid-cols-5"
              >
                <input type="hidden" name="extraId" value={extra.id} />
                <input
                  name="productionName"
                  list="production-names"
                  placeholder="Production *"
                  required
                  className={`${inputClass} sm:col-span-2`}
                />
                <datalist id="production-names">
                  {productions.map((production) => (
                    <option key={production.id} value={production.name} />
                  ))}
                </datalist>
                <input name="role" placeholder="Role" className={inputClass} />
                <input name="date" type="date" className={inputClass} />
                <input name="feeEur" inputMode="decimal" placeholder="Fee €" className={inputClass} />
                <button
                  type="submit"
                  className="rounded-lg bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-white sm:col-span-5"
                >
                  Add booking
                </button>
              </form>
            </Panel>

            {extra.notes ? (
              <Panel title="Notes">
                <p className="whitespace-pre-wrap text-sm text-neutral-200">
                  {extra.notes}
                </p>
              </Panel>
            ) : null}
          </div>

          <div className="space-y-4">
            <Panel title="Contact">
              <Row
                label="Email"
                value={
                  extra.email ? (
                    <a href={`mailto:${extra.email}`} className="hover:text-amber-400">
                      {extra.email}
                    </a>
                  ) : null
                }
              />
              <Row
                label="Phone"
                value={
                  extra.phone ? (
                    <a href={`tel:${extra.phone}`} className="hover:text-amber-400">
                      {extra.phone}
                    </a>
                  ) : null
                }
              />
              <Row
                label="Location"
                value={[extra.postalCode, extra.city, extra.country]
                  .filter(Boolean)
                  .join(" ")}
              />
              <Row label="Nationality" value={extra.nationality} />
              <Row
                label="Languages"
                value={extra.languages.length > 0 ? extra.languages.join(", ") : null}
              />
              <Row
                label="Date of birth"
                value={extra.dateOfBirth ? dateFormat.format(extra.dateOfBirth) : null}
              />
              <Row label="Gender note" value={extra.genderNote} />
            </Panel>

            <Panel title="Sizes">
              <Row label="Height" value={extra.heightCm ? `${extra.heightCm} cm` : null} />
              <Row label="Weight" value={extra.weightKg ? `${extra.weightKg} kg` : null} />
              <Row label="Clothing size" value={extra.clothingSize} />
              <Row label="Shoe size (EU)" value={extra.shoeSizeEu} />
              <Row label="Chest" value={extra.chestCm ? `${extra.chestCm} cm` : null} />
              <Row label="Waist" value={extra.waistCm ? `${extra.waistCm} cm` : null} />
              <Row label="Hips" value={extra.hipsCm ? `${extra.hipsCm} cm` : null} />
              <Row label="Hair" value={[extra.hairColor, extra.hairLength].filter(Boolean).join(", ")} />
              <Row label="Eyes" value={extra.eyeColor} />
              <Row label="Facial hair" value={extra.facialHair} />
              <Row label="Tattoos" value={extra.tattoos ? "Yes" : null} />
              <Row label="Piercings" value={extra.piercings ? "Yes" : null} />
            </Panel>

            <Panel title="Fee & logistics">
              <Row label="Day rate" value={formatMoney(extra.dayRateEur)} />
              <Row label="Hourly rate" value={formatMoney(extra.hourRateEur)} />
              <Row
                label="Driver's licence"
                value={extra.hasDriversLicense ? "Yes" : "No"}
              />
              <Row label="Own car" value={extra.hasCar ? "Yes" : "No"} />
              <Row label="Available" value={extra.available ? "Yes" : "No"} />
            </Panel>
          </div>
        </div>
      </main>
    </>
  );
}
