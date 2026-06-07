import Link from "next/link";
import Wordmark from "./Wordmark";
import { ArrowUpRight, Smiley } from "./icons";

const COLS = [
  {
    title: "Product",
    links: ["3D Room View", "Room Vibes", "Shop the Room", "AR Preview"],
  },
  {
    title: "Campuses",
    links: ["Columbia", "Barnard", "NYU", "Request your school"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press", "Contact"],
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-8">
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-8">
        <div className="rounded-[2.4rem] bg-card/55 p-2 hairline backdrop-blur-sm ambient">
          <div className="rounded-[calc(2.4rem-0.5rem)] bg-card px-6 py-12 inner-core sm:px-12 sm:py-14">
            <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 lg:grid-cols-5">
              <div className="col-span-2">
                <Wordmark className="h-8 w-auto" />
                <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-soft">
                  The dorm design studio that knows your actual room. See it, style
                  it, live it — built for college students.
                </p>
                <Link
                  href="/onboarding"
                  className="group mt-6 inline-flex items-center gap-2 rounded-full bg-blue py-2 pl-4 pr-2 text-sm font-semibold text-paper transition-all duration-500 ease-spring hover:bg-blue-deep active:scale-[0.98]"
                >
                  Find your room
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-paper/15 transition-transform duration-500 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-px">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>

              {COLS.map((c) => (
                <div key={c.title}>
                  <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-faint">
                    {c.title}
                  </h4>
                  <ul className="mt-4 space-y-2.5">
                    {c.links.map((l) => (
                      <li key={l}>
                        <Link
                          href="#"
                          className="text-sm text-ink-soft transition-colors duration-300 hover:text-navy"
                        >
                          {l}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-navy/10 pt-6 sm:flex-row sm:items-center">
              <p className="text-xs text-ink-faint">© 2026 The Shaft. Made for move-in day.</p>
              <span className="inline-flex items-center gap-2 rounded-full bg-paper-2 px-3 py-1.5 text-xs font-medium text-ink-soft">
                <Smiley className="h-4 w-4 text-blue" /> Built at the NYC Intern Hackathon
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
