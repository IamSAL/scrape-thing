//@ts-check
const fs = require("fs");
const path = require("path");
const logFile = path.join(__dirname, "logs.txt");
const csvFile = path.join(__dirname, "logs.csv");

function writeLink(link, pageNumber) {
  const timestamp = new Date().toISOString();
  const linkEntry = `[${timestamp}] Page ${pageNumber}:\nTitle: ${link.text}\nURL: ${link.href}\n-------------------\n`;
  fs.appendFileSync(logFile, linkEntry);
  console.log(`Found new link: ${link.text}`);

  // Write to CSV
  const csvEntry = `${timestamp},Page ${pageNumber},${link.text},${link.href}\n`;
  fs.appendFileSync(csvFile, csvEntry, { flag: "a" }); // Append mode for CSV
}

function writeZipLink(zipInfo) {
  const timestamp = new Date().toISOString();
  const zipEntry = `[${timestamp}] ZIP File Found:\nTitle: ${zipInfo.title}\nURL: ${zipInfo.url}\nFrom Page: ${zipInfo.sourceUrl}\n-------------------\n`;
  fs.appendFileSync(logFile, zipEntry);
  console.log(`Found ZIP file: ${zipInfo.title}`);

  // Write to CSV
  const csvEntry = `${timestamp},ZIP File Found,${zipInfo.title},${zipInfo.url},${zipInfo.sourceUrl}\n`;
  fs.appendFileSync(csvFile, csvEntry, { flag: "a" });
}

function writeSessionStart() {
  const separator = "\n" + "=".repeat(50) + "\n";
  const sessionStart = `${separator}New Scraping Session Started at ${new Date().toISOString()}${separator}\n`;
  fs.appendFileSync(logFile, sessionStart);

  // Write session start to CSV
  fs.appendFileSync(csvFile, "Timestamp,Type,Title,URL,Source\n", {
    flag: "a",
  }); // Add header on session start
}

module.exports = {
  writeLink,
  writeZipLink,
  writeSessionStart,
};
