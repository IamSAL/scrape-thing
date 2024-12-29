//@ts-check
const { scrapeJanuaryLinks, getZipLinks } = require("./scraper");
const {
  downloadZipFilesBatch,
  downloadZipFilesSingle,
} = require("./downloader");
const { writeSessionStart } = require("./helpers");
const { zipFileLinks } = require("./data");
(async () => {
  try {
    writeSessionStart();
    // const links = await scrapeJanuaryLinks();
    // console.log(`${links.length} page links collected`);

    // const zipLinks = await getZipLinks(links);
    // console.log(`${zipLinks.length} file links collected`);

    // const downloadResults = await downloadZipFilesBatch(zipLinks);
    // console.log(downloadResults);

      const downloadResults = await downloadZipFilesSingle(zipFileLinks);
      console.log(downloadResults);
  } catch (error) {
    console.error("Script failed:", error);
  }
})();
