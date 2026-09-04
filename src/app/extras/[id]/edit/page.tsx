import { notFound } from "next/navigation";
import Nav from "@/components/nav";
import ExtraForm, { type ExtraFormValues } from "@/components/extra-form";
import { prisma } from "@/lib/prisma";
import { toDateInput } from "@/lib/extras";
import { updateExtra } from "../../actions";

export const dynamic = "force-dynamic";

function text(value: string | null | undefined): string {
  return value ?? "";
}

function numText(value: number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

export default async function EditExtraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const extra = await prisma.extra.findUnique({ where: { id } });
  if (!extra) notFound();

  const values: ExtraFormValues = {
    firstName: extra.firstName,
    lastName: extra.lastName,
    email: text(extra.email),
    phone: text(extra.phone),
    gender: extra.gender ?? "",
    genderNote: text(extra.genderNote),
    dateOfBirth: toDateInput(extra.dateOfBirth),
    nationality: text(extra.nationality),
    languages: extra.languages.join(", "),
    city: text(extra.city),
    postalCode: text(extra.postalCode),
    country: text(extra.country),
    heightCm: numText(extra.heightCm),
    weightKg: numText(extra.weightKg),
    clothingSize: text(extra.clothingSize),
    chestCm: numText(extra.chestCm),
    waistCm: numText(extra.waistCm),
    hipsCm: numText(extra.hipsCm),
    shoeSizeEu: numText(extra.shoeSizeEu),
    hairColor: text(extra.hairColor),
    hairLength: text(extra.hairLength),
    eyeColor: text(extra.eyeColor),
    facialHair: text(extra.facialHair),
    tattoos: extra.tattoos,
    piercings: extra.piercings,
    dayRateEur: extra.dayRateEur === null ? "" : String(Number(extra.dayRateEur)),
    hourRateEur: extra.hourRateEur === null ? "" : String(Number(extra.hourRateEur)),
    hasDriversLicense: extra.hasDriversLicense,
    hasCar: extra.hasCar,
    available: extra.available,
    notes: text(extra.notes),
  };

  const action = updateExtra.bind(null, id);

  return (
    <>
      <Nav active="extras" />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <h1 className="mb-5 text-2xl font-semibold text-white">
          Edit {extra.firstName} {extra.lastName}
        </h1>
        <ExtraForm
          action={action}
          values={values}
          submitLabel="Save changes"
          cancelHref={`/extras/${id}`}
        />
      </main>
    </>
  );
}
