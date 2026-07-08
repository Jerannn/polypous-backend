const { join } = require("path");
import env from "../config/env.js";
/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Direct the cache into the project directory so it gets compiled/packaged correctly
  cacheDirectory: env.STAGE === "production" ? join(__dirname, ".cache", "puppeteer") : undefined,
};
