const puppeteer = require("puppeteer");
require("dotenv").config();

const scrape = async (url) => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
    headless: "new",
  });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" });
  let data = await page.evaluate(() => {
    return document
      .getElementsByTagName("ytd-video-renderer")[0]
      .children[0].children[1].children[0].children[0].children[0].children[1].getAttribute(
        "href"
      );
  });

  return "https://www.youtube.com" + data;
};

module.exports = scrape;
