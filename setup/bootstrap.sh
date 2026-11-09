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

# --- 4. Doppler CLI (Linux) ---
# Templates call dopplerProjectJson while chezmoi renders the target state,
# which happens before any run_* script, so Doppler must exist and be logged
# in first. Omarchy ships mise; other distros need mise installed beforehand.
if [ "$OS" = "linux" ] && ! command -v doppler >/dev/null 2>&1; then
    if command -v mise >/dev/null 2>&1; then
        echo "📦 Installing Doppler CLI with mise..."
        mise use -g github:DopplerHQ/cli@latest
        export PATH="${MISE_DATA_DIR:-$HOME/.local/share/mise}/shims:$PATH"
    else
        echo "❌ Doppler CLI is required. Install mise (https://mise.jdx.dev) or Doppler, then re-run." >&2
        exit 1
    fi
fi
if command -v doppler >/dev/null 2>&1 && ! doppler me >/dev/null 2>&1; then
    echo "🔑 Logging in to Doppler..."
    doppler login
fi

# --- 5. Initialize dotfiles ---
echo "🚀 Initializing Stackclash dotfiles..."
chezmoi init --apply Stackclash

echo "🎉 Dotfiles setup complete!"