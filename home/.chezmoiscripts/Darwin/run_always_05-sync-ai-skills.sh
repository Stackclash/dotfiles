#!/bin/bash
# Sync user AI skills and agents from ~/.ai into Claude Code and GitHub Copilot for Azure

AI_SKILLS_DIR="$HOME/.ai/skills"
AI_AGENTS_DIR="$HOME/.ai/agents"
CLAUDE_SKILLS="$HOME/.claude/skills"
CLAUDE_AGENTS="$HOME/.claude/agents"
COPILOT_SKILLS="$HOME/.agents/skills"
COPILOT_MANIFEST="$HOME/.agents/.copilot-for-azure-skills-manifest.json"

mkdir -p "$CLAUDE_SKILLS" "$CLAUDE_AGENTS"

ensure_symlink() {
    local link="$1" target="$2"
    if [ -L "$link" ] && [ "$(readlink "$link")" = "$target" ]; then
        return
    fi
    rm -rf "$link"
    ln -s "$target" "$link"
}

# Sync skills -> Claude and Copilot for Azure
if [ -d "$AI_SKILLS_DIR" ]; then
    for skill_path in "$AI_SKILLS_DIR"/*/; do
        [ -d "$skill_path" ] || continue
        skill_name="$(basename "$skill_path")"

        ensure_symlink "$CLAUDE_SKILLS/$skill_name" "$skill_path"

        if [ -d "$COPILOT_SKILLS" ]; then
            ensure_symlink "$COPILOT_SKILLS/$skill_name" "$skill_path"
        fi
    done

    # Add user skills to the Copilot for Azure manifest without removing extension-managed ones
    if [ -f "$COPILOT_MANIFEST" ] && command -v python3 >/dev/null 2>&1; then
        python3 - "$AI_SKILLS_DIR" "$COPILOT_MANIFEST" <<'PYEOF'
import json, os, sys

skills_dir, manifest_path = sys.argv[1], sys.argv[2]

with open(manifest_path) as f:
    manifest = json.load(f)

existing = set(manifest.get("skills", []))
for name in os.listdir(skills_dir):
    if os.path.isdir(os.path.join(skills_dir, name)):
        existing.add(name)

manifest["skills"] = sorted(existing)
with open(manifest_path, "w") as f:
    json.dump(manifest, f, indent=2)
PYEOF
    fi
fi

# Sync agents -> Claude only (Copilot agents are extension-defined)
if [ -d "$AI_AGENTS_DIR" ]; then
    for agent_path in "$AI_AGENTS_DIR"/*/; do
        [ -d "$agent_path" ] || continue
        agent_name="$(basename "$agent_path")"
        ensure_symlink "$CLAUDE_AGENTS/$agent_name" "$agent_path"
    done
fi
