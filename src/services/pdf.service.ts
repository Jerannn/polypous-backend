import puppeteer, { Browser } from "puppeteer";

let browser: Browser | null = null;

// Initialize browser once at startup
export async function initBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });
  }
  return browser;
}

export default async function generate(html: string) {
  // Reuse the existing browser instance
  const currentBrowser = await initBrowser();
  const page = await currentBrowser.newPage();

  try {
    // const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "load",
      timeout: 10000,
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    return pdf;
  } finally {
    await page.close();
  }
}
