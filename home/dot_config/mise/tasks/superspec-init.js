#!/usr/bin/env node
//MISE description="Set up the superspec OpenSpec schema in the current repo (opt-in, per-project)"
//MISE dir="{{cwd}}"
//
// Opt-in, per-project helper for https://github.com/danielhanold/superspec.
// Run from a repo root that already has OpenSpec + Superpowers set up:
//   mise run superspec-init
//
// It sparse-checks-out the superspec schema into openspec/schemas/superspec/
// and writes openspec/config.yaml. Cross-platform (uses Node fs, not `cp`).

const { execSync } = require("child_process")
const { existsSync, mkdirSync, mkdtempSync, rmSync, cpSync, writeFileSync } = require("fs")
const os = require("os")
const path = require("path")

const REPO = process.cwd()
const SCHEMA_DEST = path.join(REPO, "openspec", "schemas", "superspec")
const CONFIG = path.join(REPO, "openspec", "config.yaml")
const REPO_URL = "https://github.com/danielhanold/superspec.git"

function have(cmd) {
  try {
    execSync(process.platform === "win32" ? `where ${cmd}` : `command -v ${cmd}`, { stdio: "ignore" })
    return true
  } catch {
    return false
  }
}

function run(cmd) {
  execSync(cmd, { stdio: "inherit" })
}

// --- prerequisite checks ---------------------------------------------------

if (!have("git")) {
  console.error("❌ git is required and was not found on PATH.")
  process.exit(1)
}
if (!have("openspec")) {
  console.error("❌ openspec CLI not found. Enable it first (it's a managed AI tool):")
  console.error("   mise install   # installs @fission-ai/openspec")
  process.exit(1)
}
if (!existsSync(path.join(REPO, "openspec"))) {
  console.error("❌ No openspec/ folder here. Initialize OpenSpec first, e.g.:")
  console.error("   openspec init --profile custom")
  process.exit(1)
}
if (!have("jq")) {
  console.warn("⚠️  jq not found — optional, but recommended for full superspec automation.")
}

// --- sparse-checkout the schema -------------------------------------------

const tmp = mkdtempSync(path.join(os.tmpdir(), "superspec-"))
try {
  console.log("⬇️  Fetching superspec schema…")
  run(`git clone --depth 1 --filter=blob:none --sparse ${REPO_URL} "${tmp}"`)
  run(`git -C "${tmp}" sparse-checkout set openspec/schemas/superspec`)

  const src = path.join(tmp, "openspec", "schemas", "superspec")
  if (!existsSync(src)) {
    console.error(`❌ Expected schema at ${src} but it was not found in the checkout.`)
    process.exit(1)
  }
  mkdirSync(SCHEMA_DEST, { recursive: true })
  cpSync(src, SCHEMA_DEST, { recursive: true })
  console.log(`✅ Schema copied to ${path.relative(REPO, SCHEMA_DEST)}/`)
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

// --- config + verify -------------------------------------------------------

writeFileSync(CONFIG, "schema: superspec\n")
console.log(`✅ Wrote ${path.relative(REPO, CONFIG)}`)

console.log("\n🔎 Verifying…")
try {
  run("openspec schemas")
  run("openspec validate")
  console.log("\n✅ superspec is set up in this repo.")
} catch {
  console.warn("\n⚠️  Verification reported issues — check the output above.")
}
