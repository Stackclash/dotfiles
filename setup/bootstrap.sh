#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Starting dotfiles bootstrap..."

# --- 1. Detect OS ---
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"

# --- 2. Detect architecture ---
ARCH="$(uname -m)"
case "$ARCH" in
    x86_64) ARCH="amd64" ;;
    arm64|aarch64) ARCH="arm64" ;;
    armv7l|armv6l) ARCH="arm" ;;
esac

# --- 3. Install chezmoi if missing ---
if ! command -v chezmoi >/dev/null 2>&1; then
    echo "📦 Installing chezmoi..."

    # ChezMoi official installer (POSIX-compliant)
    sh -c "$(curl -fsLS get.chezmoi.io)" -- -b "$HOME/.local/bin"

    export PATH="$HOME/.local/bin:$PATH"

    if ! command -v chezmoi >/dev/null 2>&1; then
        echo "❌ Failed to install chezmoi." >&2
        exit 1
    fi
else
    echo "✔ chezmoi is already installed."
fi

# --- 4. Initialize dotfiles ---
echo "🚀 Initializing Stackclash dotfiles..."
chezmoi init --apply Stackclash

echo "🎉 Dotfiles setup complete!"