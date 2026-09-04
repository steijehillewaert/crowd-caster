import { z } from "zod";

export const GENDERS = ["FEMALE", "MALE", "NON_BINARY", "OTHER"] as const;
export type GenderValue = (typeof GENDERS)[number];

export const GENDER_LABELS: Record<GenderValue, string> = {
  FEMALE: "Female",
  MALE: "Male",
  NON_BINARY: "Non-binary",
  OTHER: "Other / self-described",
};

/** Empty form fields arrive as "" — treat those as "not filled in". */
const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable();

const optionalInt = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : Number(value)))
  .refine((value) => value === null || Number.isFinite(value), "Must be a number")
  .transform((value) => (value === null ? null : Math.round(value)));

const optionalDecimal = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : Number(value.replace(",", "."))))
  .refine((value) => value === null || Number.isFinite(value), "Must be a number");

const optionalDate = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : new Date(value)))
  .refine(
    (value) => value === null || !Number.isNaN(value.getTime()),
    "Invalid date",
  );

const checkbox = z
  .union([z.literal("on"), z.literal("true"), z.literal(""), z.null()])
  .transform((value) => value === "on" || value === "true");

export const extraSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .refine(
      (value) => value === null || z.email().safeParse(value).success,
      "Invalid email address",
    ),
  phone: optionalText,
  gender: z
    .string()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .refine(
      (value) => value === null || GENDERS.includes(value as GenderValue),
      "Invalid gender",
    ),
  genderNote: optionalText,
  dateOfBirth: optionalDate,
  nationality: optionalText,
  languages: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  city: optionalText,
  postalCode: optionalText,
  country: optionalText,
  heightCm: optionalInt,
  weightKg: optionalInt,
  clothingSize: optionalText,
  chestCm: optionalInt,
  waistCm: optionalInt,
  hipsCm: optionalInt,
  shoeSizeEu: optionalInt,
  hairColor: optionalText,
  hairLength: optionalText,
  eyeColor: optionalText,
  facialHair: optionalText,
  tattoos: checkbox,
  piercings: checkbox,
  dayRateEur: optionalDecimal,
  hourRateEur: optionalDecimal,
  hasDriversLicense: checkbox,
  hasCar: checkbox,
  available: checkbox,
  notes: optionalText,
});

export type ExtraInput = z.infer<typeof extraSchema>;

export function parseExtraForm(formData: FormData) {
  const raw = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    genderNote: String(formData.get("genderNote") ?? ""),
    dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
    nationality: String(formData.get("nationality") ?? ""),
    languages: String(formData.get("languages") ?? ""),
    city: String(formData.get("city") ?? ""),
    postalCode: String(formData.get("postalCode") ?? ""),
    country: String(formData.get("country") ?? ""),
    heightCm: String(formData.get("heightCm") ?? ""),
    weightKg: String(formData.get("weightKg") ?? ""),
    clothingSize: String(formData.get("clothingSize") ?? ""),
    chestCm: String(formData.get("chestCm") ?? ""),
    waistCm: String(formData.get("waistCm") ?? ""),
    hipsCm: String(formData.get("hipsCm") ?? ""),
    shoeSizeEu: String(formData.get("shoeSizeEu") ?? ""),
    hairColor: String(formData.get("hairColor") ?? ""),
    hairLength: String(formData.get("hairLength") ?? ""),
    eyeColor: String(formData.get("eyeColor") ?? ""),
    facialHair: String(formData.get("facialHair") ?? ""),
    tattoos: formData.get("tattoos") as string | null,
    piercings: formData.get("piercings") as string | null,
    dayRateEur: String(formData.get("dayRateEur") ?? ""),
    hourRateEur: String(formData.get("hourRateEur") ?? ""),
    hasDriversLicense: formData.get("hasDriversLicense") as string | null,
    hasCar: formData.get("hasCar") as string | null,
    available: formData.get("available") as string | null,
    notes: String(formData.get("notes") ?? ""),
  };

  return extraSchema.safeParse(raw);
}

export function ageFrom(dateOfBirth: Date | null | undefined): number | null {
  if (!dateOfBirth) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const monthDelta = now.getUTCMonth() - dateOfBirth.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getUTCDate() < dateOfBirth.getUTCDate())) {
    age -= 1;
  }
  return age;
}

export function formatMoney(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function fullName(extra: { firstName: string; lastName: string }): string {
  return `${extra.firstName} ${extra.lastName}`.trim();
}

/** Turn a date-of-birth into the YYYY-MM-DD an <input type="date"> expects. */
export function toDateInput(value: Date | null | undefined): string {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}
