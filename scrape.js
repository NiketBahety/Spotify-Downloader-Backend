const puppeteer = require("puppeteer");

const scrape = async (url) => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.goto(url);
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
