import { execSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("🚀 Building QuickSplit 2.0 bundle with Vite...");
execSync("npx vite build", { stdio: "inherit" });

const distFile = path.resolve("dist/template.html");
if (!fs.existsSync(distFile)) {
  console.error("❌ Error: dist/template.html was not generated.");
  process.exit(1);
}

let html = fs.readFileSync(distFile, "utf8");

// Convert type="module" script to universal standard script for seamless file:/// and http execution
html = html.replace(/<script type="module" crossorigin>/g, "<script>");

// Ensure favicon points to assets/favicon.svg
html = html.replace(/href="\.\/favicon-[^"]+"/g, 'href="assets/favicon.svg"');
html = html.replace(/href="\/assets\/favicon\.svg"/g, 'href="assets/favicon.svg"');

// Write to root index.html
fs.writeFileSync(path.resolve("index.html"), html, "utf8");
console.log(`✅ Successfully generated standalone root index.html! (${(html.length / 1024).toFixed(1)} KB)`);
