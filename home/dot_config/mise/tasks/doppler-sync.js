#!/usr/bin/env node
//MISE description="Sync secrets from Doppler for the current project and environment"
//MISE dir="{{cwd}}"
//USAGE flag "-e --env <env>" help="Doppler Environment Config" default="dev" {
//USAGE     choices "dev" "prd"
//USAGE }
//USAGE arg "<project>" help="Doppler project"
const { execSync } = require("child_process")
const { existsSync, readFileSync, writeFileSync } = require("fs")
const path = require("path")

const {usage_env, usage_project} = process.env

if (!usage_project) {
  console.log("❌ Project not provided")
  process.exit(1)
}

// Detect current folder name
const folderName = path.basename(process.cwd())
const dopplerConfig = `${usage_env}_${folderName}`

// Fetch secrets from Doppler
console.log(`🔐 Fetching secrets from Doppler config: ${usage_project}/${dopplerConfig}`)
let dopplerOutput
try {
  dopplerOutput = execSync(
    `doppler secrets download --project ${usage_project} --config ${dopplerConfig} --no-file --format json`,
    { encoding: "utf-8" }
  )
} catch (err) {
  console.error("❌ Failed to fetch secrets from Doppler:", err.message)
  process.exit(1)
}

const dopplerSecrets = JSON.parse(dopplerOutput)
for (const key of Object.keys(dopplerSecrets)) {
  if (key.startsWith('DOPPLER')) {
    delete dopplerSecrets[key]
  }
}
const envPath = path.join(process.cwd(), ".env")
const localSettingsPath = path.join(process.cwd(), "local.settings.json")
const hostFilePath = path.join(process.cwd(), 'host.json')

if (existsSync(localSettingsPath) || existsSync(hostFilePath)) {
  console.log("📝 Merging into local.settings.json...")
  let json = {}
  if (existsSync(localSettingsPath)) {
    json = JSON.parse(readFileSync(localSettingsPath, "utf-8"))
  }
  json.Values = { ...json.Values, ...dopplerSecrets }
  writeFileSync(localSettingsPath, JSON.stringify(json, null, 2))
  console.log("✅ local.settings.json updated successfully")
} else if (existsSync(envPath)) {
  console.log("📝 Merging into .env file...")
  const existingEnv = readFileSync(envPath, "utf-8")
    .split("\n")
    .filter(Boolean)
    .reduce((acc, line) => {
      const [key, ...rest] = line.split("=")
      acc[key.trim()] = rest.join("").replaceAll('"', '').trim()
      return acc
    }, {})

  const merged = { ...existingEnv, ...dopplerSecrets }
  const output = Object.entries(merged)
    .map(([k, v]) => `${k}="${v}"`)
    .join("\n")

  writeFileSync(envPath, output)
  console.log("✅ .env updated successfully")
} else {
  console.log("⚙️ No .env, host.json, or local.settings.json found — creating .env")
  const output = Object.entries(dopplerSecrets)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n")
  writeFileSync(envPath, output)
  console.log("✅ .env created successfully")
}
