#!/usr/bin/env node
//MISE description="Set up the superspec OpenSpec schema in the current repo (opt-in, per-project)"
//MISE dir="{{cwd}}"
//
// Opt-in, per-project helper for https://github.com/danielhanold/superspec.
// Run from a repo root that already has OpenSpec + Superpowers set up:
//   mise run superspec-init
//
// It configures the global OpenSpec profile/delivery/workflows superspec needs,
// sparse-checks-out the superspec schema into openspec/schemas/superspec/ and
// writes openspec/config.yaml. Cross-platform (uses Node fs, not `cp`/`jq`).

const { execSync } = require("child_process")
const {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  cpSync,
  readFileSync,
  writeFileSync,
} = require("fs")
const os = require("os")
const path = require("path")

const REPO = process.cwd()
const SCHEMA_DEST = path.join(REPO, "openspec", "schemas", "superspec")
const CONFIG = path.join(REPO, "openspec", "config.yaml")
const REPO_URL = "https://github.com/danielhanold/superspec.git"

// Workflows superspec requires to be enabled in the global OpenSpec config.
const REQUIRED_WORKFLOWS = [
  "propose",
  "explore",
  "new",
  "continue",
  "apply",
  "ff",
  "sync",
  "archive",
  "bulk-archive",
  "verify",
]

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

function capture(cmd) {
  return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }).trim()
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"))
  } catch {
    return {}
  }
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

// --- global OpenSpec config (profile / delivery / workflows) ---------------

const globalConfig = capture("openspec config path")
const before = existsSync(globalConfig) ? readJson(globalConfig) : {}
const enabled = Array.isArray(before.workflows) ? before.workflows : []
const missing = REQUIRED_WORKFLOWS.filter((w) => !enabled.includes(w))

if (!missing.length && before.profile === "custom" && before.delivery === "both") {
  console.log("✅ Global OpenSpec config already matches superspec (profile, delivery, workflows).")
} else {
  console.log(`⚙️  Configuring global OpenSpec config: ${globalConfig}`)

  // Seed a known-good baseline, then switch to the profile superspec expects.
  run("openspec config profile core")
  run("openspec config set profile custom")
  run("openspec config set delivery both")

  // `openspec config set` can't take an array from the shell portably, so patch
  // the JSON directly. Keep any extra workflows the user had already enabled.
  const extras = enabled.filter((w) => !REQUIRED_WORKFLOWS.includes(w))
  const config = readJson(globalConfig)
  config.workflows = [...REQUIRED_WORKFLOWS, ...extras]
  writeFileSync(globalConfig, `${JSON.stringify(config, null, 2)}\n`)
  console.log(`✅ Enabled workflows: ${config.workflows.join(", ")}`)
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
  const workflows = JSON.parse(capture("openspec config get workflows"))
  const stillMissing = REQUIRED_WORKFLOWS.filter((w) => !workflows.includes(w))
  if (stillMissing.length) {
    console.warn(`⚠️  Workflows still not enabled: ${stillMissing.join(", ")}`)
    console.warn("   Run `openspec config profile` and enable all workflows interactively.")
  } else {
    console.log(`✅ Workflows enabled: ${workflows.join(", ")}`)
  }
  run("openspec update")
  console.log("\n✅ superspec is set up in this repo.")
} catch {
  console.warn("\n⚠️  Verification reported issues — check the output above.")
}
