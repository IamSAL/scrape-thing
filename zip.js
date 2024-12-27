//@ts-check
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip"); // Install: npm install adm-zip

const sourceDir = "./downloads"; // Path to the root directory
const destinationDir = "./extracted_files"; // Path to the destination directory
const pattern = "19"; // Pattern to search for in file names

// Create the destination directory if it doesn't exist
if (!fs.existsSync(destinationDir)) {
  fs.mkdirSync(destinationDir, { recursive: true });
}

// Recursive function to traverse directories and extract/process files
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // Recursively process subdirectories
      processDirectory(filePath);
    } else if (path.extname(file) === ".zip") {
      try {
        // Extract zip file
        console.log("processing zip file", filePath);
        const zip = new AdmZip(filePath);
        const zipEntries = zip.getEntries();

        zipEntries.forEach((zipEntry) => {
          const entryPath = path.join(dirPath, zipEntry.entryName);

          // Check if the extracted file name matches the pattern
          if (zipEntry.entryName.includes(pattern)) {
            // Create the destination path
            const destPath = path.join(destinationDir, zipEntry.entryName);

            // Ensure the destination directory exists
            const destDirPath = path.dirname(destPath);
            if (!fs.existsSync(destDirPath)) {
              fs.mkdirSync(destDirPath, { recursive: true });
            }

            // Extract the file
            fs.writeFileSync(destPath, zipEntry.getData());
            console.log(`Extracted and moved: ${zipEntry.entryName}`);
          }
        });
      } catch (e) {
       
    
        // Move the corrupted file from the source directory as well
        const sourceCorruptedDir = path.join(sourceDir, "corrupted");
        if (!fs.existsSync(sourceCorruptedDir)) {
          fs.mkdirSync(sourceCorruptedDir, { recursive: true });
        }
        const sourceCorruptedFilePath = path.join(sourceCorruptedDir, path.basename(filePath));
        fs.renameSync(filePath, sourceCorruptedFilePath);
       
        console.log("Failed to process zip file", filePath, e.message);
      }
    } else if (file.includes(pattern)) {
      // Move files directly if they match the pattern
      const destPath = path.join(destinationDir, file);
      fs.copyFileSync(filePath, destPath);
      console.log(`Moved: ${file}`);
    }
  });
}

// Start processing from the root directory
processDirectory(sourceDir);
