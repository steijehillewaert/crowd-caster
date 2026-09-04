"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { GENDERS, GENDER_LABELS } from "@/lib/extras";
import type { FormState } from "@/app/extras/actions";

export type ExtraFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  genderNote: string;
  dateOfBirth: string;
  nationality: string;
  languages: string;
  city: string;
  postalCode: string;
  country: string;
  heightCm: string;
  weightKg: string;
  clothingSize: string;
  chestCm: string;
  waistCm: string;
  hipsCm: string;
  shoeSizeEu: string;
  hairColor: string;
  hairLength: string;
  eyeColor: string;
  facialHair: string;
  tattoos: boolean;
  piercings: boolean;
  dayRateEur: string;
  hourRateEur: string;
  hasDriversLicense: boolean;
  hasCar: boolean;
  available: boolean;
  notes: string;
};

export const EMPTY_EXTRA: ExtraFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "",
  genderNote: "",
  dateOfBirth: "",
  nationality: "",
  languages: "",
  city: "",
  postalCode: "",
  country: "BE",
  heightCm: "",
  weightKg: "",
  clothingSize: "",
  chestCm: "",
  waistCm: "",
  hipsCm: "",
  shoeSizeEu: "",
  hairColor: "",
  hairLength: "",
  eyeColor: "",
  facialHair: "",
  tattoos: false,
  piercings: false,
  dayRateEur: "",
  hourRateEur: "",
  hasDriversLicense: false,
  hasCar: false,
  available: true,
  notes: "",
};

const inputClass =
  "w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-amber-500";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-400">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-neutral-600">{hint}</span> : null}
    </label>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Check({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-neutral-300">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 rounded border-neutral-700 bg-neutral-950 accent-amber-500"
      />
      {label}
    </label>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-amber-400 disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export default function ExtraForm({
  action,
  values,
  submitLabel,
  cancelHref,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  values: ExtraFormValues;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <Section title="Identity">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="First name *">
            <input
              name="firstName"
              required
              defaultValue={values.firstName}
              className={inputClass}
            />
          </Field>
          <Field label="Last name *">
            <input
              name="lastName"
              required
              defaultValue={values.lastName}
              className={inputClass}
            />
          </Field>
          <Field label="Date of birth">
            <input
              name="dateOfBirth"
              type="date"
              defaultValue={values.dateOfBirth}
              className={inputClass}
            />
          </Field>
          <Field label="Gender">
            <select name="gender" defaultValue={values.gender} className={inputClass}>
              <option value="">Not specified</option>
              {GENDERS.map((gender) => (
                <option key={gender} value={gender}>
                  {GENDER_LABELS[gender]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Gender note" hint="Only if they self-described.">
            <input
              name="genderNote"
              defaultValue={values.genderNote}
              className={inputClass}
            />
          </Field>
          <Field label="Nationality">
            <input
              name="nationality"
              defaultValue={values.nationality}
              className={inputClass}
            />
          </Field>
          <Field label="Email">
            <input
              name="email"
              type="email"
              defaultValue={values.email}
              className={inputClass}
            />
          </Field>
          <Field label="Phone">
            <input name="phone" defaultValue={values.phone} className={inputClass} />
          </Field>
          <Field label="Languages" hint="Comma separated, e.g. NL, FR, EN">
            <input
              name="languages"
              defaultValue={values.languages}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section title="Location">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="City">
            <input name="city" defaultValue={values.city} className={inputClass} />
          </Field>
          <Field label="Postal code">
            <input
              name="postalCode"
              defaultValue={values.postalCode}
              className={inputClass}
            />
          </Field>
          <Field label="Country" hint="ISO code, e.g. BE, NL, FR">
            <input
              name="country"
              defaultValue={values.country}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section title="Sizes & appearance">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Field label="Height (cm)">
            <input
              name="heightCm"
              type="number"
              min={80}
              max={250}
              defaultValue={values.heightCm}
              className={inputClass}
            />
          </Field>
          <Field label="Weight (kg)">
            <input
              name="weightKg"
              type="number"
              min={20}
              max={300}
              defaultValue={values.weightKg}
              className={inputClass}
            />
          </Field>
          <Field label="Clothing size" hint="e.g. S, M, L, 38, 52">
            <input
              name="clothingSize"
              defaultValue={values.clothingSize}
              className={inputClass}
            />
          </Field>
          <Field label="Shoe size (EU)">
            <input
              name="shoeSizeEu"
              type="number"
              min={15}
              max={55}
              defaultValue={values.shoeSizeEu}
              className={inputClass}
            />
          </Field>
          <Field label="Chest (cm)">
            <input
              name="chestCm"
              type="number"
              defaultValue={values.chestCm}
              className={inputClass}
            />
          </Field>
          <Field label="Waist (cm)">
            <input
              name="waistCm"
              type="number"
              defaultValue={values.waistCm}
              className={inputClass}
            />
          </Field>
          <Field label="Hips (cm)">
            <input
              name="hipsCm"
              type="number"
              defaultValue={values.hipsCm}
              className={inputClass}
            />
          </Field>
          <Field label="Hair colour">
            <input
              name="hairColor"
              defaultValue={values.hairColor}
              className={inputClass}
            />
          </Field>
          <Field label="Hair length">
            <input
              name="hairLength"
              defaultValue={values.hairLength}
              className={inputClass}
            />
          </Field>
          <Field label="Eye colour">
            <input
              name="eyeColor"
              defaultValue={values.eyeColor}
              className={inputClass}
            />
          </Field>
          <Field label="Facial hair">
            <input
              name="facialHair"
              defaultValue={values.facialHair}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-5">
          <Check name="tattoos" label="Visible tattoos" defaultChecked={values.tattoos} />
          <Check
            name="piercings"
            label="Visible piercings"
            defaultChecked={values.piercings}
          />
        </div>
      </Section>

      <Section title="Booking">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Day rate (EUR)">
            <input
              name="dayRateEur"
              inputMode="decimal"
              defaultValue={values.dayRateEur}
              className={inputClass}
            />
          </Field>
          <Field label="Hourly rate (EUR)">
            <input
              name="hourRateEur"
              inputMode="decimal"
              defaultValue={values.hourRateEur}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-5">
          <Check
            name="hasDriversLicense"
            label="Driver's licence"
            defaultChecked={values.hasDriversLicense}
          />
          <Check name="hasCar" label="Own car" defaultChecked={values.hasCar} />
          <Check
            name="available"
            label="Available for bookings"
            defaultChecked={values.available}
          />
        </div>
        <div className="mt-4">
          <Field label="Notes">
            <textarea
              name="notes"
              rows={4}
              defaultValue={values.notes}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      {state.error ? (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
        <Link
          href={cancelHref}
          className="rounded-lg border border-neutral-800 px-4 py-2.5 text-sm text-neutral-400 transition hover:text-white"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
