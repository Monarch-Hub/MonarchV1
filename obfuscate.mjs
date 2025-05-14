// obfuscate.mjs
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const excludedDirs = ["node_modules", ".git", "auth"];
const baseDir = __dirname;

function obfuscateDir(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!excludedDirs.includes(file)) obfuscateDir(fullPath);
    } else if (file.endsWith(".js")) {
      const obfPath = fullPath.replace(".js", ".obf.js");
      console.log(`Obfuscating: ${fullPath}`);
      execSync(`javascript-obfuscator "${fullPath}" --output "${obfPath}" --compact true --control-flow-flattening true`);
    }
  });
}

obfuscateDir(baseDir);
console.log("Obfuscation complete.");