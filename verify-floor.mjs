import puppeteer from "puppeteer";

const browser = await puppeteer.launch({
  headless: "new",
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--enable-webgl",
    "--ignore-gpu-blocklist",
    "--disable-gpu-sandbox",
  ],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

page.on("console", (msg) => console.log("[console]", msg.type(), msg.text()));
page.on("pageerror", (err) => console.log("[pageerror]", err.message));

await page.goto("http://localhost:3000/room/B1207", { waitUntil: "networkidle0", timeout: 120000 });
console.log("Page loaded");

// Wait for the canvas / scene to render
await new Promise((r) => setTimeout(r, 8000));
await page.screenshot({ path: "/tmp/before-mirror.png" });
console.log("Captured before-mirror screenshot");

// Find and click the "Mirror" button in the sidebar
const clicked = await page.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll("button"));
  const mirrorBtn = buttons.find((b) => b.textContent?.includes("Mirror"));
  if (mirrorBtn) {
    mirrorBtn.click();
    return true;
  }
  return false;
});
console.log("Clicked Mirror button:", clicked);

await new Promise((r) => setTimeout(r, 6000));
await page.screenshot({ path: "/tmp/after-mirror.png" });
console.log("Captured after-mirror screenshot");

await browser.close();
