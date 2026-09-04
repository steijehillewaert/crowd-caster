import Nav from "@/components/nav";
import ExtraForm, { EMPTY_EXTRA } from "@/components/extra-form";
import { createExtra } from "../actions";

export const metadata = { title: "New extra · Crowd Caster" };

export default function NewExtraPage() {
  return (
    <>
      <Nav active="extras" />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <h1 className="mb-5 text-2xl font-semibold text-white">New extra</h1>
        <ExtraForm
          action={createExtra}
          values={EMPTY_EXTRA}
          submitLabel="Create extra"
          cancelHref="/"
        />
        <p className="mt-4 text-sm text-neutral-500">
          Photos can be added once the profile exists.
        </p>
      </main>
    </>
  );
}
