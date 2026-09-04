import Link from "next/link";
import { logout } from "@/app/login/actions";

export default function Nav({ active }: { active: "extras" | "productions" }) {
  const linkClass = (name: string) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      active === name
        ? "bg-neutral-800 text-white"
        : "text-neutral-400 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-base font-semibold text-white">Crowd Caster</span>
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-500 sm:inline">
            Crowdproductions
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/" className={linkClass("extras")}>
            Extras
          </Link>
          <Link href="/productions" className={linkClass("productions")}>
            Productions
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/extras/new"
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-neutral-950 transition hover:bg-amber-400"
          >
            Add extra
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-neutral-800 px-3 py-1.5 text-sm text-neutral-400 transition hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
