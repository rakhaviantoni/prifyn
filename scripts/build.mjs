import { spawnSync } from "node:child_process";

const isNetlify = process.env.NETLIFY === "true";
const command = isNetlify ? "next" : "vinext";
const args = isNetlify ? ["build", "--webpack"] : ["build"];
const env = isNetlify
  ? process.env
  : { ...process.env, WRANGLER_LOG_PATH: ".wrangler/wrangler.log" };

console.log(
  isNetlify
    ? "Building PRIFYN with Next.js for Netlify..."
    : "Building PRIFYN with Vinext for Cloudflare/Sites...",
);

const result = spawnSync(command, args, {
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
