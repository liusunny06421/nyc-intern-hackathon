import puppeteer from "puppeteer";

const browser = await puppeteer.launch({
  headless: "new",
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader-webgl",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
    "--enable-webgl",
    "--no-sandbox",
  ],
});
const page = await browser.newPage();
page.on("console", (msg) => console.log("[console]", msg.type(), msg.text()));
page.on("pageerror", (err) => console.log("[pageerror]", err.message));
page.on("requestfailed", (req) => console.log("[requestfailed]", req.url(), req.failure()?.errorText));
page.on("response", (res) => {
  if (res.url().includes(".glb")) console.log("[response]", res.status(), res.url());
});

await page.setViewport({ width: 1280, height: 800 });
await page.goto("http://localhost:3000/room/B1207", { waitUntil: "domcontentloaded", timeout: 120000 });

// wait for the furniture sidebar button labeled "Mirror"
await page.waitForFunction(() => {
  return Array.from(document.querySelectorAll("button")).some((b) => b.textContent?.includes("Mirror"));
}, { timeout: 60000 });

console.log("--- clicking Mirror button ---");
await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Mirror"));
  btn?.click();
});

// give it time to load the (large) glb
await new Promise((r) => setTimeout(r, 50000));

await page.screenshot({ path: "/tmp/mirror-after-click.png" });
console.log("--- screenshot saved ---");
await browser.close();
