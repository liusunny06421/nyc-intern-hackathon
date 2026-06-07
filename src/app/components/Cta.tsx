import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "./icons";

type CtaProps = {
  href: string;
  children: ReactNode;
  variant?: "solid" | "ghost";
  className?: string;
  icon?: ReactNode;
};

/* Island pill with a nested "button-in-button" trailing icon + magnetic hover physics. */
export default function Cta({ href, children, variant = "solid", className = "", icon }: CtaProps) {
  const solid = variant === "solid";
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 rounded-full pl-6 pr-2 py-2 text-[0.95rem] font-semibold
        transition-all duration-500 ease-spring active:scale-[0.98] will-change-transform
        ${
          solid
            ? "bg-blue text-paper ambient-blue hover:bg-blue-deep"
            : "bg-card/70 text-navy hairline backdrop-blur-sm hover:bg-card"
        } ${className}`}
    >
      <span className="tracking-tight">{children}</span>
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-500 ease-spring
          group-hover:translate-x-0.5 group-hover:-translate-y-[1px] group-hover:scale-105
          ${solid ? "bg-paper/20 text-paper" : "bg-blue/10 text-blue"}`}
      >
        {icon ?? <ArrowUpRight className="h-[18px] w-[18px]" />}
      </span>
    </Link>
  );
}
