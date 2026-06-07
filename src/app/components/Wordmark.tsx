type WordmarkProps = {
  className?: string;
  tone?: "default" | "paper";
};

/* DormDesign lockup — ivy-leaf seal + two-tone rounded wordmark
   (Grass "Dorm" + Cobalt "Design"), per the brand board. */
export default function Wordmark({ className = "h-7 w-auto", tone = "default" }: WordmarkProps) {
  const first = tone === "paper" ? "text-paper" : "text-grass";
  const second = tone === "paper" ? "text-sky" : "text-blue";
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="relative flex h-full aspect-square items-center justify-center rounded-[0.5em] bg-grass ambient">
        <span className="absolute inset-[12%] rounded-[0.38em] ring-1 ring-white/20" />
        <svg viewBox="0 0 24 24" className="relative h-[62%] w-[62%]" fill="none" stroke="#fff6e6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21c0-6 1-10 8-13-1 8-3 11-8 13Z" fill="#fff6e6" stroke="none" />
          <path d="M12 21c0-6-1-10-8-13 1 8 3 11 8 13Z" fill="#e1ead2" stroke="none" />
          <path d="M12 21V9" stroke="#2e7d46" strokeWidth={1.3} />
        </svg>
      </span>
      <span className="font-display text-[1.18em] font-semibold leading-none tracking-[-0.02em]">
        <span className={first}>The</span>
        <span className={second}>Shaft</span>
      </span>
    </span>
  );
}
