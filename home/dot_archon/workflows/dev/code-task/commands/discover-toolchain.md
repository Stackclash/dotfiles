# Discover the repository's checks

Find the exact commands this repository uses to run its tests, lint, build, and
type-check. Later steps run these commands as deterministic gates, so a wrong or
invented command breaks the run. Report only what the repository itself
declares.

## Where to look

In this order, stopping for each check once you find it:

1. `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `CONTRIBUTING*`,
   `README*` — documented commands win, because they are what humans run.
2. Task runners: `package.json` `scripts`, `Makefile`, `justfile`,
   `Taskfile.yml`, `mise.toml` / `.mise.toml` tasks, `pyproject.toml`
   (`[tool.*]` and scripts), `*.csproj` / `*.sln`, `Cargo.toml`, `go.mod`.
3. CI configuration: `.github/workflows/*.yml`, `azure-pipelines.yml`,
   `.gitlab-ci.yml` — the commands CI runs.

## Rules

- Look only inside this repository. Never search the whole filesystem, your
  home directory, or a drive root (`find /`, `find ~`, and similar): such
  searches can run for hours and hang this run.
- Each command must be runnable from the repository root as-is.
- Prefer the repository's wrapper (`npm test`, `make test`, `just lint`) over the
  underlying tool, so its configuration applies.
- Do not invent a command because a tool is "usually" present. If you cannot
  point to where the repository declares it, return `""` for that check.
- `has_tests` is true only if the repository contains automated tests **and** a
  declared way to run them. Test files with no way to run them: false.
- Exclude watch modes, coverage uploads, and anything that deploys or publishes.

## Output

Return `has_tests`, and `test`, `lint`, `build`, `typecheck` as command strings
(`""` when none is declared).
