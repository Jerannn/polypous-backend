import puppeteer, { Browser } from "puppeteer";

let browserPromise: Promise<Browser> | null = null;

// Initialize browser once and reuse the promise to prevent race conditions
export function initBrowser(): Promise<Browser> {
  if (!browserPromise) {
    console.log("🚀 Launching Puppeteer browser instance...");
    browserPromise = puppeteer
      .launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
      })
      .then((browser) => {
        console.log("✅ Puppeteer browser launched successfully.");

        // Reset the promise if the browser disconnects/crashes so the next request starts a fresh one
        browser.once("disconnected", () => {
          console.warn("⚠️ Puppeteer browser disconnected or crashed. Resetting instance...");
          browserPromise = null;
        });

        return browser;
      })
      .catch((err) => {
        console.error("💥 Failed to launch Puppeteer browser:", err);
        browserPromise = null; // Reset on failure so the next request can retry
        throw err;
      });
  }
  return browserPromise;
}

export default async function generate(html: string) {
  const currentBrowser = await initBrowser();
  const page = await currentBrowser.newPage();

  try {
    await page.setContent(html, {
      waitUntil: "load",
      timeout: 15000,
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    return pdf;
  } finally {
    if (page) {
      await page.close().catch((err) => console.error("Error closing page:", err));
    }
  }
}

// Graceful cleanup function to prevent zombie Chromium processes during dev restarts (nodemon/tsx)
const cleanup = async () => {
  if (browserPromise) {
    try {
      console.log("🧹 Closing Puppeteer browser...");
      const browser = await browserPromise;
      await browser.close();
      console.log("👋 Puppeteer browser closed.");
    } catch (err) {
      console.error("Error closing Puppeteer browser during cleanup:", err);
    } finally {
      browserPromise = null;
    }
  }
};

// Handle process termination/restart signals
process.on("SIGINT", async () => {
  await cleanup();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await cleanup();
  process.exit(0);
});

// Nodemon restart signal handler
process.once("SIGUSR2", async () => {
  await cleanup();
  process.kill(process.pid, "SIGUSR2");
});
