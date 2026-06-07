import Link from "next/link";
import Nav from "./components/Nav";
import Reveal from "./components/Reveal";
import Cta from "./components/Cta";
import RoomScene from "./components/RoomScene";
import Footer from "./components/Footer";
import StringLights from "./components/StringLights";
import IvyVine from "./components/IvyVine";
import Sticker, { SealBadge } from "./components/Sticker";
import {
  ArrowUpRight,
  Building,
  Cube,
  Sparkle,
  Pin,
  Bag,
  Ruler,
  Layers,
  Compass,
  Rotate,
  Smiley,
  Heart,
  Check,
} from "./components/icons";

const SCHOOLS = ["Columbia", "NYU", "Cornell", "Barnard", "Fordham", "Pace", "The New School"];

const STEPS = [
  {
    n: "01",
    icon: Building,
    title: "Pick your building",
    body: "Search your campus and choose your exact dorm. We already know the floor plans for Columbia's Broadway buildings.",
    span: "lg:col-span-5",
  },
  {
    n: "02",
    icon: Cube,
    title: "Get your room in 3D",
    body: "Enter your room number and World Labs renders a navigable 3D model of your actual space — true dimensions, real windows, real corners.",
    span: "lg:col-span-7",
  },
  {
    n: "03",
    icon: Sparkle,
    title: "Style with the agent",
    body: "Drop in inspo, get pro design directions, and see furniture that physically fits — then shop it from IKEA and Target with AR preview.",
    span: "lg:col-span-12",
  },
];

const VIBES = [
  { name: "Cozy & Warm", hue: "from-clay/35 to-sun/30", dot: "bg-clay", tag: "warm · layered" },
  { name: "Retro Collage", hue: "from-lilac/45 to-tomato/20", dot: "bg-tomato", tag: "eclectic · fun" },
  { name: "Minimal Calm", hue: "from-paper-2 to-sage-soft", dot: "bg-sage", tag: "clean · airy" },
  { name: "Color Pop", hue: "from-sky/70 to-blue/30", dot: "bg-blue", tag: "bold · playful" },
];

const PRODUCTS = [
  { name: "Cozy Knit Throw", store: "Target", price: "$29", fit: "Color matched", hue: "from-clay/30 to-clay/10" },
  { name: "Ivy String Lights", store: "IKEA", price: "$18", fit: "Fits any wall", hue: "from-sun/40 to-sun/10" },
  { name: "Poster Pack", store: "Target", price: "$14", fit: "6 prints", hue: "from-lilac/40 to-tomato/15" },
  { name: "Wood Desk", store: "IKEA", price: "$129", fit: "Fits · 120cm", hue: "from-mocha/35 to-mocha/10" },
];

export default function Home() {
  return (
    <main className="relative flex-1 overflow-hidden">
      <Nav />

      {/* animated background orbs (warm sunlight + ivy) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-[-6rem] -top-10 h-[30rem] w-[30rem] rounded-full bg-sun/25 blur-3xl animate-drift" />
        <div className="absolute -left-32 top-24 h-[28rem] w-[28rem] rounded-full bg-sky/25 blur-3xl animate-float-slower" />
        <div className="absolute left-1/3 top-[120rem] h-[26rem] w-[26rem] rounded-full bg-grass/12 blur-3xl animate-drift" />
      </div>

      {/* string lights draped across the top */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[4.25rem] z-0">
        <StringLights className="w-full" />
      </div>

      {/* trailing ivy from the top corners */}
      <div aria-hidden className="pointer-events-none absolute -left-3 top-1 z-0 hidden w-24 lg:block">
        <IvyVine />
      </div>
      <div aria-hidden className="pointer-events-none absolute -right-3 top-1 z-0 hidden w-24 lg:block">
        <IvyVine flip />
      </div>

      {/* ===================== HERO ===================== */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 pb-24 pt-36 sm:px-8 lg:grid-cols-2 lg:gap-10 lg:pb-32 lg:pt-44">
        <div className="relative z-10">
          <Reveal as="div" className="inline-flex items-center gap-2 rounded-full bg-card/70 py-1.5 pl-2 pr-4 hairline backdrop-blur-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-grass text-paper">
              <Pin className="h-3.5 w-3.5" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-soft">
              Now live · Columbia Broadway dorms
            </span>
          </Reveal>

          <Reveal as="h1" delay={80} className="mt-7 font-display text-[3.4rem] font-medium leading-[0.95] tracking-[-0.03em] text-navy sm:text-7xl lg:text-[5.2rem]">
            See it.
            <br />
            Style it.
            <br />
            <span className="text-blue">Live it.</span>
          </Reveal>

          <Reveal as="p" delay={160} className="mt-7 max-w-md text-lg leading-relaxed text-ink-soft text-balance">
            Type in your dorm room number and instantly walk a true-to-life 3D
            model of <em className="font-display font-semibold not-italic text-blue">your</em> room —
            then fill it with furniture that actually fits.
          </Reveal>

          {/* double-bezel room finder */}
          <Reveal as="div" delay={240} className="mt-9 max-w-md">
            <form action="/onboarding" className="rounded-[1.7rem] bg-card/60 p-1.5 hairline backdrop-blur-sm ambient">
              <div className="flex items-center gap-2 rounded-[calc(1.7rem-0.375rem)] bg-card p-2 inner-core">
                <div className="flex flex-1 items-center gap-2.5 pl-3">
                  <Building className="h-5 w-5 shrink-0 text-blue" />
                  <input
                    name="room"
                    placeholder="Hartley Hall · HAR 327"
                    className="w-full bg-transparent py-2.5 text-[0.95rem] font-medium text-navy placeholder:text-ink-faint focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  aria-label="Find your room"
                  className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue text-paper transition-all duration-500 ease-spring hover:bg-blue-deep active:scale-95"
                >
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-500 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </form>
            <div className="mt-4 flex items-center gap-4 pl-1 text-xs text-ink-faint">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-sage" /> No measuring tape
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-sage" /> Free for students
              </span>
            </div>
          </Reveal>
        </div>

        {/* hero room visual */}
        <Reveal as="div" delay={140} className="relative">
          <div className="relative mx-auto max-w-xl rounded-[2.4rem] bg-card/55 p-2 hairline backdrop-blur-sm ambient-lg">
            <div className="relative overflow-hidden rounded-[calc(2.4rem-0.5rem)] bg-gradient-to-br from-sky/60 via-card to-paper-2 inner-core">
              {/* top chrome */}
              <div className="flex items-center justify-between px-5 pt-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-grass px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-paper">
                  <Cube className="h-3.5 w-3.5" /> 3D Room View
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-card/80 px-2.5 py-1 text-[10px] font-semibold text-navy hairline">
                  <span className="h-2 w-2 rounded-full bg-sun ring-2 ring-sun/30" /> Daylight
                </span>
              </div>
              <RoomScene className="w-full animate-float-slow" />
            </div>

            {/* die-cut stickers */}
            <Sticker rotate="-7deg" className="absolute -left-5 top-12 hidden rounded-2xl bg-card px-3 py-2 sm:inline-flex sm:items-center sm:gap-2" wobble>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sun/40 text-ink">
                <Ruler className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold text-ink">2.7m × 3.4m</span>
            </Sticker>
            <Sticker rotate="6deg" className="absolute -right-4 bottom-20 hidden rounded-full bg-blue px-3 py-2 sm:inline-flex sm:items-center sm:gap-2">
              <Smiley className="h-5 w-5 text-sun" />
              <span className="text-xs font-bold text-paper">It fits!</span>
            </Sticker>
            <SealBadge
              lines={["Built", "for college", "life"]}
              tone="blue"
              rotate="12deg"
              className="absolute -right-7 top-4 hidden h-20 w-20 sm:flex animate-wobble"
            />
          </div>
        </Reveal>
      </section>

      {/* ===================== TRUST MARQUEE ===================== */}
      <section className="border-y border-navy/10 bg-card/40 py-7 backdrop-blur-sm">
        <div className="flex items-center gap-4 px-4 sm:justify-center">
          <span className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-faint sm:block">
            Built for campuses like
          </span>
          <div className="relative w-full overflow-hidden sm:max-w-3xl [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
            <div className="flex w-max animate-marquee items-center gap-10">
              {[...SCHOOLS, ...SCHOOLS].map((s, i) => (
                <span key={i} className="whitespace-nowrap font-display text-xl font-medium tracking-tight text-navy/70">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-24 sm:px-8 lg:py-32">
        <Reveal as="div" className="max-w-2xl">
          <Eyebrow icon={Compass}>How it works</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] text-navy sm:text-5xl">
            From room number to{" "}
            <span className="text-blue">move-in ready</span> in three steps.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 90} className={s.span}>
              <BezelCard className="group h-full">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-paper transition-transform duration-500 ease-spring group-hover:-translate-y-1 group-hover:rotate-3">
                      <s.icon className="h-6 w-6" />
                    </span>
                    <span className="font-display text-2xl font-semibold text-ink-faint/45">{s.n}</span>
                  </div>
                  <h3 className="mt-7 text-xl font-bold tracking-tight text-navy">{s.title}</h3>
                  <p className="mt-2.5 max-w-md text-[0.95rem] leading-relaxed text-ink-soft">{s.body}</p>
                </div>
              </BezelCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===================== 3D ROOM VIEW ===================== */}
      <section id="room" className="mx-auto max-w-7xl px-4 py-24 sm:px-8 lg:py-32">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal as="div">
            <Eyebrow icon={Cube}>3D Room View · powered by World Labs</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] text-navy sm:text-5xl text-balance">
              Your room, <span className="text-blue">before</span> move-in day.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
              Generated from real floor plans and photos, every model carries true
              dimensions. Rotate it, walk it, and tap any object to swap, measure, or shop it.
            </p>

            <ul className="mt-8 space-y-3">
              {(
                [
                  ["True-to-the-centimeter dimensions", Ruler],
                  ["Each object is editable & shoppable", Layers],
                  ["AR preview before you buy", Sparkle],
                ] as [string, typeof Ruler][]
              ).map(([label, Icon]) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-card hairline text-blue">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="text-[0.95rem] font-medium text-navy">{label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-9">
              <Cta href="/room/B1207" icon={<Cube className="h-[18px] w-[18px]" />}>
                Tour a live room
              </Cta>
            </div>
          </Reveal>

          <Reveal as="div" delay={120}>
            <div className="relative rounded-[2.4rem] bg-card/55 p-2 hairline backdrop-blur-sm ambient-lg">
              <div className="relative overflow-hidden rounded-[calc(2.4rem-0.5rem)] bg-gradient-to-tr from-paper-2 via-card to-sky/50 inner-core">
                <RoomScene className="w-full" />
                {/* control bar */}
                <div className="absolute inset-x-0 bottom-3 flex justify-center">
                  <div className="flex items-center gap-1 rounded-full bg-navy/90 p-1 backdrop-blur-md">
                    {[Compass, Rotate, Layers, Ruler].map((Ic, i) => (
                      <span
                        key={i}
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-paper transition-colors duration-300 hover:bg-paper/15 ${i === 1 ? "bg-paper/15" : ""}`}
                      >
                        <Ic className="h-[18px] w-[18px]" />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================== ROOM VIBES ===================== */}
      <section id="vibes" className="mx-auto max-w-7xl px-4 py-24 sm:px-8 lg:py-32">
        <Reveal as="div" className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <Eyebrow icon={Heart}>Room vibes</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] text-navy sm:text-5xl">
              Find a look that <span className="text-grass">feels like you.</span>
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-ink-soft">
            Upload a few inspo pics and the agent translates them into pro design
            directions — then styles your 3D room to match.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {VIBES.map((v, i) => (
            <Reveal key={v.name} delay={i * 80}>
              {/* taped poster on the wall */}
              <div
                className={`group relative rounded-[1.4rem] bg-card p-2.5 ambient transition-all duration-500 ease-spring hover:-translate-y-2 hover:!rotate-0 ${
                  i % 2 === 0 ? "lg:rotate-[-2.5deg]" : "lg:rotate-[2deg]"
                }`}
              >
                {/* washi tape */}
                <span className="absolute -top-2.5 left-1/2 z-10 h-5 w-16 -translate-x-1/2 -rotate-3 rounded-[3px] bg-sun/55 backdrop-blur-[1px] ambient" />
                <div className={`relative aspect-[4/5] overflow-hidden rounded-[0.9rem] bg-gradient-to-br ${v.hue} inner-core`}>
                  <div className="absolute inset-0 opacity-60 [background:radial-gradient(60%_50%_at_30%_20%,rgba(255,255,255,0.75),transparent)]" />
                  <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-card/85 text-navy backdrop-blur-sm transition-transform duration-500 ease-spring group-hover:rotate-12">
                    <ArrowUpRight className="h-[18px] w-[18px]" />
                  </span>
                  <span className={`absolute bottom-3 left-3 h-3 w-3 rounded-full ${v.dot} ring-4 ring-card/70`} />
                </div>
                <div className="flex items-center justify-between px-1.5 py-2.5">
                  <span className="font-display font-semibold tracking-tight text-navy">{v.name}</span>
                  <span className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">{v.tag}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===================== SHOP THE ROOM ===================== */}
      <section id="shop" className="mx-auto max-w-7xl px-4 py-24 sm:px-8 lg:py-32">
        <div className="rounded-[2.6rem] bg-card/55 p-2 hairline backdrop-blur-sm ambient-lg">
          <div className="rounded-[calc(2.6rem-0.5rem)] bg-gradient-to-b from-paper-2/60 to-card px-5 py-12 inner-core sm:px-10 sm:py-16">
            <Reveal as="div" className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-xl">
                <Eyebrow icon={Bag}>Shop the room</Eyebrow>
                <h2 className="mt-5 font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] text-navy sm:text-5xl">
                  Only what <span className="text-grass">actually fits.</span>
                </h2>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-ink-soft">
                Real products from IKEA and Target, filtered against your room&apos;s
                true dimensions. No more returns.
              </p>
            </Reveal>

            <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {PRODUCTS.map((p, i) => (
                <Reveal key={p.name} delay={i * 80}>
                  <div className="group rounded-[1.5rem] bg-card p-2 hairline transition-all duration-500 ease-spring hover:-translate-y-1 ambient">
                    <div className={`relative aspect-square overflow-hidden rounded-[calc(1.5rem-0.5rem)] bg-gradient-to-br ${p.hue} inner-core`}>
                      <span className="absolute left-2.5 top-2.5 rounded-full bg-card/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-navy backdrop-blur-sm">
                        {p.store}
                      </span>
                      <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-sage/90 px-2.5 py-1 text-[10px] font-semibold text-white">
                        <Check className="h-3 w-3" /> {p.fit}
                      </span>
                      <span className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-card/85 text-navy backdrop-blur-sm transition-transform duration-500 ease-spring group-hover:scale-110">
                        <Bag className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-2.5">
                      <span className="text-sm font-semibold tracking-tight text-navy">{p.name}</span>
                      <span className="text-sm font-bold text-blue">{p.price}</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FINAL CTA ===================== */}
      <section className="mx-auto max-w-7xl px-4 pb-28 sm:px-8">
        <Reveal as="div">
          <div className="relative overflow-hidden rounded-[2.6rem] bg-navy px-6 py-16 text-center ambient-blue sm:px-10 sm:py-24">
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue/40 blur-3xl animate-float-slow" />
              <div className="absolute -right-16 bottom-[-6rem] h-80 w-80 rounded-full bg-columbia/25 blur-3xl animate-float-slower" />
            </div>
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-paper/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-columbia">
                <Smiley className="h-4 w-4" /> Let&apos;s make it yours
              </span>
              <h2 className="mx-auto mt-6 max-w-2xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] text-paper sm:text-6xl text-balance">
                Your dorm is about to look <span className="text-sun">unreal.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-md text-paper/70">
                Drop in your building and room number — the 3D model is ready in seconds.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Cta href="/onboarding" variant="ghost">Find your room</Cta>
                <Link href="/room/B1207" className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-columbia transition-colors hover:text-paper">
                  Tour a live room
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}

/* ---------- small local primitives ---------- */
function Eyebrow({ icon: Icon, children }: { icon: typeof Cube; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-card/70 px-3 py-1 hairline backdrop-blur-sm">
      <Icon className="h-3.5 w-3.5 text-blue" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">{children}</span>
    </span>
  );
}

function BezelCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[1.8rem] bg-card/55 p-1.5 hairline backdrop-blur-sm transition-all duration-500 ease-spring hover:-translate-y-1 ambient ${className}`}>
      <div className="h-full rounded-[calc(1.8rem-0.375rem)] bg-card p-6 inner-core sm:p-7">{children}</div>
    </div>
  );
}
