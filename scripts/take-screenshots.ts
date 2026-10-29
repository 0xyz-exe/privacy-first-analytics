import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

async function capture() {
  const screenshotDir = path.join(process.cwd(), "docs", "screenshots");
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2, // HiDPI crystal sharp
  });
  const page = await context.newPage();

  console.log("Capturing 1: Marketing Landing Page...");
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(screenshotDir, "landing.png"), fullPage: false });

  console.log("Capturing 2: Authentication Gateway...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(screenshotDir, "login.png"), fullPage: false });

  console.log("Capturing 3: Analytics Dashboard...");
  // Sign in via UI
  await page.click("button:has-text('Fill Demo')");
  await page.click("button[type='submit']");
  await page.waitForURL("**/dashboard", { timeout: 10000 });
  await page.waitForTimeout(2000); // Wait for charts and animations
  await page.screenshot({ path: path.join(screenshotDir, "dashboard.png"), fullPage: false });

  console.log("Capturing 4: Websites & Snippet Manager...");
  await page.goto("http://localhost:3000/websites", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, "websites.png"), fullPage: false });

  console.log("Capturing 5: Settings & Data Retention...");
  await page.goto("http://localhost:3000/settings", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, "settings.png"), fullPage: false });

  console.log("Capturing 6: Integration Docs...");
  await page.goto("http://localhost:3000/docs", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, "docs.png"), fullPage: false });

  await browser.close();
  console.log("All screenshots captured successfully in docs/screenshots/!");
}

capture().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
