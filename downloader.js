//@ts-check
const fs = require("fs");
const https = require("https");
const path = require("path");
const downloadFolder = path.join(__dirname, "downloads");

if (!fs.existsSync(downloadFolder)) {
  fs.mkdirSync(downloadFolder);
}

function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(downloadFolder, filename);

    if (fs.existsSync(filePath)) {
      console.log(`File already exists: ${filename}`);
      resolve({ filename, status: "skipped" });
      return;
    }

    const file = fs.createWriteStream(filePath);

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(`Failed to download ${filename}: ${response.statusCode}`)
          );
          return;
        }

        response.pipe(file);
        console.log(`Downloading: ${filename}`);
        file.on("finish", () => {
          file.close();
          console.log(`Downloaded: ${filename}`);
          resolve({ filename, status: "success" });
        });
      })
      .on("error", (err) => {
        fs.unlink(filePath, () => {}); // Delete partially downloaded file
        reject(err);
      });
  });
}

async function downloadZipFilesBatch(zipLinks) {
  const downloadPromises = zipLinks.map((link) => {
    const filename = link.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()+'.zip';
    return downloadFile(link.url, filename);
  });
  return Promise.all(downloadPromises);
}

module.exports = {
  downloadFile,
  downloadZipFilesBatch,
};
