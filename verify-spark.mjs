import puppeteer from "puppeteer";

const browser = await puppeteer.launch({
  headless: "new",
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
    "--enable-webgl",
    "--no-sandbox",
  ],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

const consoleMsgs = [];
page.on("console", (msg) => consoleMsgs.push(`[${msg.type()}] ${msg.text()}`));
page.on("pageerror", (err) => consoleMsgs.push(`[pageerror] ${err.message}`));

await page.goto("http://localhost:3000/room/B1207", { waitUntil: "networkidle2", timeout: 60000 });

await new Promise((r) => setTimeout(r, 4000));
await page.screenshot({ path: "/tmp/spark-0-initial.png" });
console.log("--- early console ---");
consoleMsgs.forEach((m) => console.log(m));
console.log("body text snippet:", (await page.evaluate(() => document.body.innerText)).slice(0, 600));

// Wait for canvas to appear
await page.waitForSelector("canvas", { timeout: 60000 });
console.log("Canvas found");

// Wait a bit for splat & sidebar to load
await new Promise((r) => setTimeout(r, 6000));

await page.screenshot({ path: "/tmp/spark-1-loaded.png" });

// Check sidebar buttons
const labels = await page.$$eval("button", (btns) =>
  btns.map((b) => b.textContent?.trim()).filter((t) => t && ["Mirror", "Lamp", "Organizer"].includes(t))
);
console.log("Sidebar labels found:", labels);

// Click "Mirror" button
const clicked = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll("button"));
  const mirrorBtn = btns.find((b) => b.textContent?.includes("Mirror"));
  if (mirrorBtn) { mirrorBtn.click(); return true; }
  return false;
});
console.log("Clicked Mirror button:", clicked);

await new Promise((r) => setTimeout(r, 5000));
await page.screenshot({ path: "/tmp/spark-2-furniture-placed.png" });

// Try a drag on canvas center
const canvasBox = await page.evaluate(() => {
  const c = document.querySelector("canvas");
  const r = c.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
});
const cx = canvasBox.x + canvasBox.width / 2;
const cy = canvasBox.y + canvasBox.height / 2;

await page.mouse.move(cx, cy);
await page.mouse.down();
await page.mouse.move(cx + 80, cy + 40, { steps: 20 });
await new Promise((r) => setTimeout(r, 1000));
await page.mouse.up();
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: "/tmp/spark-3-after-drag.png" });

// Press Q to rotate
await page.keyboard.down("KeyQ");
await new Promise((r) => setTimeout(r, 80));
await page.keyboard.up("KeyQ");
await new Promise((r) => setTimeout(r, 800));
await page.screenshot({ path: "/tmp/spark-4-after-rotate.png" });

// Orbit camera (drag empty area outside furniture / near edge)
await page.mouse.move(canvasBox.x + 30, canvasBox.y + 30);
await page.mouse.down();
await page.mouse.move(canvasBox.x + 200, canvasBox.y + 30, { steps: 15 });
await new Promise((r) => setTimeout(r, 500));
await page.mouse.up();
await new Promise((r) => setTimeout(r, 1000));
await page.screenshot({ path: "/tmp/spark-5-after-orbit.png" });

console.log("\n--- Console messages ---");
consoleMsgs.forEach((m) => console.log(m));

await browser.close();
