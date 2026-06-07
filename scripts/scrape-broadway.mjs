// Scrapes Columbia Housing for Broadway Hall reference photos + floor plans.
// Columbia Housing is behind a Cloudflare JS challenge, so we drive a real
// (stealth) Chromium instance, wait for the interstitial to clear, then harvest
// every image and floor-plan/PDF asset.
//
// Usage:  node scripts/scrape-broadway.mjs
// Output: src/data/broadway.json  (+ downloaded assets in public/reference/broadway/)

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

puppeteer.use(StealthPlugin());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_JSON = path.join(ROOT, "src/data/broadway.json");
const ASSET_DIR = path.join(ROOT, "public/reference/broadway");

const TARGETS = [
  { key: "main", url: "https://www.housing.columbia.edu/broadway" },
  { key: "roomselection", url: "https://roomselection.housing.columbia.edu/broadway" },
];

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function waitForCloudflare(page) {
  // The challenge page sets <title>Just a moment...</title>. Poll until it clears.
  for (let i = 0; i < 30; i++) {
    const title = await page.title().catch(() => "");
    const isChallenge = /just a moment|attention required|verifying/i.test(title);
    if (!isChallenge) return true;
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}

function isImage(u) {
  return /\.(jpe?g|png|webp|avif|gif)(\?|$)/i.test(u);
}
function isFloorPlan(u, alt = "") {
  return /floor|plan/i.test(u) || /floor|plan/i.test(alt) || /\.pdf(\?|$)/i.test(u);
}

async function harvest(page) {
  return page.evaluate(() => {
    const abs = (u) => { try { return new URL(u, location.href).href; } catch { return null; } };
    const out = { images: [], links: [], bg: [] };

    // <img> tags (incl. lazy-loaded src variants)
    document.querySelectorAll("img").forEach((img) => {
      const src = img.currentSrc || img.src || img.getAttribute("data-src") || img.getAttribute("data-lazy-src");
      if (src) out.images.push({ url: abs(src), alt: img.alt || "", w: img.naturalWidth, h: img.naturalHeight });
      // srcset — grab the largest
      const ss = img.getAttribute("srcset");
      if (ss) ss.split(",").forEach((part) => { const u = part.trim().split(" ")[0]; if (u) out.images.push({ url: abs(u), alt: img.alt || "" }); });
    });

    // <a href> — floor plans, PDFs
    document.querySelectorAll("a[href]").forEach((a) => {
      out.links.push({ url: abs(a.href), text: (a.textContent || "").trim().slice(0, 80) });
    });

    // CSS background-image (hero banners often live here)
    document.querySelectorAll("*").forEach((el) => {
      const bg = getComputedStyle(el).backgroundImage;
      const m = bg && bg.match(/url\(["']?([^"')]+)["']?\)/);
      if (m) out.bg.push(abs(m[1]));
    });

    return out;
  });
}

async function downloadAsset(page, url, destDir) {
  try {
    const resp = await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    if (!resp || !resp.ok()) return null;
    const buf = await resp.buffer();
    const name = path.basename(new URL(url).pathname).split("?")[0] || `asset-${Date.now()}`;
    const dest = path.join(destDir, name);
    await fs.writeFile(dest, buf);
    return `/reference/broadway/${name}`;
  } catch {
    return null;
  }
}

async function main() {
  await fs.mkdir(ASSET_DIR, { recursive: true });
  await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled"],
  });

  const collected = { images: [], floorPlans: [], scrapedAt: new Date().toISOString(), sources: [] };

  for (const target of TARGETS) {
    const page = await browser.newPage();
    await page.setUserAgent(UA);
    await page.setViewport({ width: 1440, height: 900 });
    console.log(`\n→ ${target.url}`);
    try {
      await page.goto(target.url, { waitUntil: "networkidle2", timeout: 45000 });
      const cleared = await waitForCloudflare(page);
      if (!cleared) { console.log("  ✗ Cloudflare challenge did not clear"); await page.close(); continue; }
      console.log("  ✓ Page loaded:", await page.title());
      // Scroll to trigger lazy-loaded images
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 200)); }
      });
      const data = await harvest(page);
      collected.sources.push({ ...target, title: await page.title(), imageCount: data.images.length, linkCount: data.links.length });

      data.images.concat(data.bg.map((url) => ({ url, alt: "" }))).forEach((img) => {
        if (img.url && isImage(img.url) && !collected.images.find((x) => x.url === img.url)) {
          collected.images.push({ url: img.url, alt: img.alt, source: target.key });
        }
      });
      data.links.forEach((l) => {
        if (l.url && isFloorPlan(l.url, l.text) && !collected.floorPlans.find((x) => x.url === l.url)) {
          collected.floorPlans.push({ url: l.url, text: l.text, source: target.key });
        }
      });
      console.log(`  images: ${data.images.length}, links: ${data.links.length}`);
    } catch (e) {
      console.log("  ✗ error:", e.message);
    }
    await page.close();
  }

  // Download the images locally (so we own a stable reference DB)
  console.log(`\nDownloading ${collected.images.length} images locally…`);
  const dl = await browser.newPage();
  await dl.setUserAgent(UA);
  for (const img of collected.images.slice(0, 60)) {
    const local = await downloadAsset(dl, img.url, ASSET_DIR);
    if (local) img.local = local;
  }
  await dl.close();
  await browser.close();

  await fs.writeFile(OUT_JSON, JSON.stringify(collected, null, 2));
  console.log(`\n✓ Saved ${collected.images.length} images, ${collected.floorPlans.length} floor plans → ${OUT_JSON}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
