/* eslint-disable no-undef */
const fs = require('fs');
const path = require('path');

const rootDestDir = './js';
const rootSourceDir = './src';

// Extracting mappings from command line arguments
const argv = process.argv.slice(2);
const mappings = {};
for (let i = 0; i < argv.length; i += 2) {
  mappings[argv[i]] = argv[i + 1];
}


function copyFiles(srcDir, destDir, ext) {
  
  const pattern = new RegExp(`.${ext}$`);

  if (fs.existsSync(srcDir)) {

    const entries = fs.readdirSync(srcDir, { withFileTypes: true });

    for (const entry of entries) {

      const srcPath = path.join(srcDir, entry.name);
      const relativePath = path.relative(rootSourceDir, srcPath);
      const destPath = path.join(rootDestDir, relativePath);

      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyFiles(srcPath, destPath, ext);
      } else if (entry.isFile() && pattern.test(entry.name)) {
        if (!fs.existsSync(path.dirname(destPath))) {
          fs.mkdirSync(path.dirname(destPath), { recursive: true });
        }
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

for (const [ext, srcDir] of Object.entries(mappings)) {
  copyFiles(srcDir, rootDestDir, ext);
}
