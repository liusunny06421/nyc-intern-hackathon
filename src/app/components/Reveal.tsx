"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
};

/* Heavy fade-up + blur entry driven by IntersectionObserver (no scroll listeners). */
export default function Reveal({ children, as, delay = 0, className = "" }: RevealProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- polymorphic tag; props vary by element
  const Tag = (as ?? "div") as any;
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ animationDelay: shown ? `${delay}ms` : undefined }}
      className={`reveal-init ${shown ? "reveal-in" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
