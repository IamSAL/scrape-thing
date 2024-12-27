//@ts-check
const puppeteer = require("puppeteer");
const fs = require("fs");
const path= require("path")
const { writeLink, writeZipLink, writeSessionStart } = require("./helpers");

const baseUrl = "https://www.bi.go.id/en/statistik/ekonomi-keuangan/seki/Default.aspx";
const targetLinkCount = 20;
const logFile = path.join(__dirname, "logs.txt");

async function scrapeJanuaryLinks() {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      // headless: false,
      protocolTimeout: 18000000,
      defaultViewport: { width: 1366, height: 768 },
      timeout: 0,
    });
  const page = await browser.newPage();
  const januaryLinks = [];
  let currentPage = 1;


  try {
    console.log("Started scraping...");

    await page.goto(baseUrl, { timeout: 0, waitUntil: "load" });

    while (januaryLinks.length < targetLinkCount) {
      console.log(`\nScanning page ${currentPage}...`);

      // Find and process links one by one
      const links = await page.$$(".media");

      for (const linkElement of links) {
        const linkData = await linkElement.evaluate((el) => ({
          text: el.querySelector(".media__title").innerText.trim(),
          href: el.querySelector("a")?.href,
        }));
        console.log(linkData.text);
        
        if (/january|JANUARY|Januari|January/i.test(linkData.text)) {
          writeLink(linkData, currentPage);
          januaryLinks.push(linkData);
          console.log(
            `Total links found: ${januaryLinks.length}/${targetLinkCount}`
          );
        }
      }

      // Check for next page
      const nextButton = await page.$(".next");
      if (!nextButton) {
        console.log("No more pages available");
        break;
      }

      // Go to next page
      console.log("Moving to next page...");
      await nextButton.click();
      await page.waitForNetworkIdle({ idleTime: 10000, threshold: 2 }),
      currentPage++;
    }

    // Write final summary
    const summary = `\n=== Scraping Completed at ${new Date().toISOString()} ===\nTotal pages processed: ${currentPage}\nTotal links found: ${
      januaryLinks.length
    }\n`;
    fs.appendFileSync(logFile, summary);
    console.log(summary);

    return januaryLinks;
  } catch (error) {
    const errorMsg = `Error during scraping: ${error.message}`;
    fs.appendFileSync(logFile, `\n${errorMsg}\n`);
    console.error(errorMsg);
    throw error;
  }
}

async function getZipLinks(links) {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: false,
    defaultViewport: { width: 1366, height: 768 },
    timeout: 0,
  });
  console.log("\nStarting ZIP file detection process...");
  fs.appendFileSync(logFile, "\n=== Starting ZIP File Detection ===\n");

  const zipLinks = [];

  try {
    // Process links in parallel batches
    const batchSize = 5; // Process 5 pages at a time
    for (let i = 0; i < links.length; i += batchSize) {
      const batch = links.slice(i, i + batchSize);
      console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1}...`);

      await Promise.all(
        batch.map(async (link) => {
          const page = await browser.newPage();
          try {
            // Navigate to the page
            await page.goto(link.href, { timeout: 0, waitUntil: "load" });

            // Find all ZIP file links on the page
            const zipInfos = await page.evaluate(() => {
              const allLinks = document.querySelectorAll("a");
              return Array.from(allLinks)
                .filter((a) => {
                  const href = a.href.toLowerCase();
                  return (
                    href.includes(".zip") ||
                    a.innerText.toLowerCase().includes(".zip")
                  );
                })
                .map((a) => ({
                  title: a.innerText.trim(),
                  url: new URL(a.href, window.location.href).href,
                }));
            });

            // Process found ZIP links
            for (const zipInfo of zipInfos) {
              zipInfo.sourceUrl = link.href;
              zipLinks.push(zipInfo);
              writeZipLink(zipInfo);
            }

            console.log(`Found ${zipInfos.length} ZIP files`);
          } catch (error) {
            console.error(`Error processing : ${error.message}`);
            fs.appendFileSync(
              logFile,
              `\nError processing : ${error.message}\n`
            );
          }
        })
      );
    }

    // Write summary
    const summary = `\n=== ZIP File Detection Complete ===\nTotal ZIP files found: ${zipLinks.length}\n`;
    fs.appendFileSync(logFile, summary);
    console.log(summary);
    
    return zipLinks;
  } catch (error) {
    console.error("Error during ZIP file detection:", error);
    fs.appendFileSync(
      logFile,
      `\nError during ZIP file detection: ${error.message}\n`
    );
    throw error;
  }
}

module.exports = {
  scrapeJanuaryLinks,
  getZipLinks,
};