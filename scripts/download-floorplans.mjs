// Downloads Broadway floor-plan images (floors 3–13) from the roomselection
// subdomain, which serves them as .jpg. Uses stealth Chromium to pass Cloudflare.

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

puppeteer.use(StealthPlugin());
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PLAN_DIR = path.join(ROOT, "public/reference/broadway/floorplans");
const DB = path.join(ROOT, "src/data/broadway.json");

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function main() {
  await fs.mkdir(PLAN_DIR, { recursive: true });
  const db = JSON.parse(await fs.readFile(DB, "utf-8"));
  // Prefer the .jpg floor plans from roomselection (directly renderable)
  const jpgPlans = db.floorPlans.filter((p) => /\.jpg$/i.test(p.url) && p.source === "roomselection");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled"],
  });
  const page = await browser.newPage();
  await page.setUserAgent(UA);

  // Warm up Cloudflare cookie by visiting the site once
  await page.goto("https://roomselection.housing.columbia.edu/broadway", { waitUntil: "networkidle2", timeout: 45000 });
  for (let i = 0; i < 15; i++) {
    if (!/just a moment/i.test(await page.title().catch(() => ""))) break;
    await new Promise((r) => setTimeout(r, 2000));
  }

  for (const plan of jpgPlans) {
    const floor = (plan.url.match(/BWY_FL_(\d+)/) || [])[1] ?? path.basename(plan.url, ".jpg");
    try {
      const resp = await page.goto(plan.url, { waitUntil: "networkidle2", timeout: 30000 });
      if (resp && resp.ok()) {
        const buf = await resp.buffer();
        const dest = path.join(PLAN_DIR, `floor-${floor}.jpg`);
        await fs.writeFile(dest, buf);
        plan.local = `/reference/broadway/floorplans/floor-${floor}.jpg`;
        plan.floor = parseInt(floor);
        console.log(`✓ floor ${floor} (${(buf.length / 1024).toFixed(0)} KB)`);
      } else {
        console.log(`✗ floor ${floor}: HTTP ${resp?.status()}`);
      }
    } catch (e) {
      console.log(`✗ floor ${floor}: ${e.message}`);
    }
  }

  await browser.close();
  await fs.writeFile(DB, JSON.stringify(db, null, 2));
  console.log(`\nUpdated ${DB} with local floor-plan paths.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
