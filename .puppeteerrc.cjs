const { join } = require("path");

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Direct the cache into the project directory so it gets compiled/packaged correctly
  cacheDirectory: join(__dirname, ".cache", "puppeteer"),
};
