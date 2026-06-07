"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "./icons";
import Wordmark from "./Wordmark";

const LINKS = [
  { label: "How it works", href: "/#how" },
  { label: "3D Room View", href: "/#room" },
  { label: "Room Vibes", href: "/#vibes" },
  { label: "Shop the Room", href: "/#shop" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-4">
        <nav
          className="mt-5 flex w-full max-w-3xl items-center justify-between gap-3 rounded-full
            border border-white/40 bg-card/65 py-2 pl-5 pr-2 backdrop-blur-xl ambient"
        >
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <Wordmark className="h-7 w-auto" />
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group relative text-[0.8rem] font-medium tracking-tight text-ink-soft transition-colors duration-300 hover:text-navy"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-navy transition-all duration-500 ease-spring group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/onboarding"
              className="group hidden items-center gap-2 rounded-full bg-blue py-2 pl-4 pr-2 text-[0.8rem] font-semibold text-paper transition-all duration-500 ease-spring hover:bg-blue-deep active:scale-[0.98] sm:inline-flex"
            >
              Find your room
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-paper/15 transition-transform duration-500 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-px">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>

            {/* Hamburger morph */}
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-navy/5 transition-colors duration-300 hover:bg-navy/10 md:hidden"
            >
              <span
                className={`absolute h-[1.5px] w-4 rounded-full bg-navy transition-all duration-500 ease-spring ${
                  open ? "rotate-45" : "-translate-y-1"
                }`}
              />
              <span
                className={`absolute h-[1.5px] w-4 rounded-full bg-navy transition-all duration-500 ease-spring ${
                  open ? "-rotate-45" : "translate-y-1"
                }`}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Full-screen glass overlay */}
      <div
        className={`fixed inset-0 z-30 flex flex-col justify-center bg-paper/80 px-6 backdrop-blur-3xl transition-all duration-500 ease-spring md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="mx-auto w-full max-w-sm">
          {LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${120 + i * 70}ms` : "0ms" }}
              className={`block border-b border-navy/10 py-5 font-display text-3xl tracking-tight text-navy transition-all duration-700 ease-spring ${
                open ? "translate-y-0 opacity-100 blur-0" : "translate-y-12 opacity-0 blur-md"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/onboarding"
            onClick={() => setOpen(false)}
            style={{ transitionDelay: open ? `${120 + LINKS.length * 70}ms` : "0ms" }}
            className={`mt-8 inline-flex w-full items-center justify-between rounded-full bg-blue py-4 pl-7 pr-3 text-lg font-semibold text-paper transition-all duration-700 ease-spring ${
              open ? "translate-y-0 opacity-100 blur-0" : "translate-y-12 opacity-0 blur-md"
            }`}
          >
            Find your room
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper/15">
              <ArrowUpRight className="h-4.5 w-4.5" />
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}
