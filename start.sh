#!/usr/bin/env bash

# ==============================================================================
# One Cloud — Automated Development Server Setup & Runner
# Runs Next.js with automatic dependency checks, environment setup, and port handling
# ==============================================================================

set -e

# Terminal Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Auto-load common environment paths (NVM, FNM, Bun, Cargo, Snap, Local)
[ -s "$HOME/.nvm/nvm.sh" ] && \. "$HOME/.nvm/nvm.sh" 2>/dev/null || true
[ -s "$HOME/.bun/_bun" ] && export BUN_INSTALL="$HOME/.bun" && export PATH="$BUN_INSTALL/bin:$PATH" 2>/dev/null || true
if [ -d "$HOME/.nvm/versions/node" ]; then
    LATEST_NVM_NODE=$(ls -1d "$HOME/.nvm/versions/node"/v* 2>/dev/null | tail -n 1 || true)
    if [ -n "$LATEST_NVM_NODE" ] && [ -d "$LATEST_NVM_NODE/bin" ]; then
        export PATH="$LATEST_NVM_NODE/bin:$PATH"
    fi
fi
export PATH="$HOME/.bun/bin:$HOME/.local/bin:$HOME/.cargo/bin:/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/snap/bin:$PATH"

echo -e "${CYAN}${BOLD}"
echo "=================================================================="
echo "    🚀 One Cloud — Automated Next.js Server Runner"
echo "=================================================================="
echo -e "${NC}"

# 1. Determine script directory (root of the project)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"
echo -e "${BLUE}📁 Working Directory:${NC} $PROJECT_DIR"

# 2. Check for Node.js
echo -e "\n${YELLOW}🔍 Checking Node.js environment...${NC}"
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Error: Node.js is not installed.${NC}"
    echo "Please install Node.js (v18.18.0 or newer) from https://nodejs.org/"
    exit 1
fi

NODE_VER=$(node -v)
echo -e "${GREEN}✓ Node.js detected:${NC} $NODE_VER"

# 3. Detect Package Manager (Bun, npm, pnpm, yarn, corepack)
PKG_MANAGER=""

if command -v bun >/dev/null 2>&1; then
    PKG_MANAGER="bun"
elif command -v npm >/dev/null 2>&1; then
    PKG_MANAGER="npm"
elif command -v pnpm >/dev/null 2>&1; then
    PKG_MANAGER="pnpm"
elif command -v yarn >/dev/null 2>&1; then
    PKG_MANAGER="yarn"
elif command -v corepack >/dev/null 2>&1; then
    echo -e "${YELLOW}ℹ️  Activating corepack to enable package managers...${NC}"
    corepack enable >/dev/null 2>&1 || true
    if command -v npm >/dev/null 2>&1; then
        PKG_MANAGER="npm"
    elif command -v pnpm >/dev/null 2>&1; then
        PKG_MANAGER="pnpm"
    fi
fi

# Fallback: Check if npm exists in node's parent directory
if [ -z "$PKG_MANAGER" ]; then
    NODE_BIN_DIR=$(dirname "$(command -v node)")
    if [ -x "$NODE_BIN_DIR/npm" ]; then
        export PATH="$NODE_BIN_DIR:$PATH"
        PKG_MANAGER="npm"
    fi
fi

# If still missing, explain how to install npm or bun in 5 seconds
if [ -z "$PKG_MANAGER" ]; then
    echo -e "\n${RED}❌ Error: Neither npm nor bun was found in your PATH.${NC}"
    echo -e "${YELLOW}In Linux distributions, npm is sometimes packaged separately from node.${NC}"
    echo -e "You can fix this easily with ONE of the following commands:"
    echo -e "  • ${BOLD}Ubuntu / Debian:${NC} sudo apt update && sudo apt install -y npm"
    echo -e "  • ${BOLD}Arch Linux / Manjaro:${NC} sudo pacman -S npm"
    echo -e "  • ${BOLD}Fedora / RHEL:${NC} sudo dnf install -y npm"
    echo -e "  • ${BOLD}Or install Bun (ultra-fast):${NC} curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo -e "${GREEN}✓ Package Manager selected:${NC} $PKG_MANAGER"

# 4. Check & Prepare .env
echo -e "\n${YELLOW}⚙️  Verifying environment variables in .env...${NC}"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}ℹ️  .env not found. Initializing from .env.example...${NC}"
        cp .env.example .env
        
        # Populate Firebase default config from firebase-applet-config.json if present
        if [ -f "firebase-applet-config.json" ]; then
            echo -e "${GREEN}✓ Syncing default Firebase config from firebase-applet-config.json into .env...${NC}"
            API_KEY=$(grep -o '"apiKey": *"[^"]*"' firebase-applet-config.json | head -1 | cut -d '"' -f 4 || true)
            AUTH_DOMAIN=$(grep -o '"authDomain": *"[^"]*"' firebase-applet-config.json | head -1 | cut -d '"' -f 4 || true)
            PROJECT_ID=$(grep -o '"projectId": *"[^"]*"' firebase-applet-config.json | head -1 | cut -d '"' -f 4 || true)
            STORAGE_BUCKET=$(grep -o '"storageBucket": *"[^"]*"' firebase-applet-config.json | head -1 | cut -d '"' -f 4 || true)
            MESSAGING_ID=$(grep -o '"messagingSenderId": *"[^"]*"' firebase-applet-config.json | head -1 | cut -d '"' -f 4 || true)
            APP_ID=$(grep -o '"appId": *"[^"]*"' firebase-applet-config.json | head -1 | cut -d '"' -f 4 || true)
            DB_ID=$(grep -o '"firestoreDatabaseId": *"[^"]*"' firebase-applet-config.json | head -1 | cut -d '"' -f 4 || true)

            cat <<EOF >> .env
NEXT_PUBLIC_FIREBASE_API_KEY="$API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="$AUTH_DOMAIN"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="$PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="$STORAGE_BUCKET"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="$MESSAGING_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="$APP_ID"
NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID="$DB_ID"
EOF
        fi
        echo -e "${GREEN}✓ .env created successfully.${NC}"
    fi
else
    echo -e "${GREEN}✓ .env is present.${NC}"
fi

# 5. Check dependencies / node_modules
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo -e "\n${YELLOW}📦 Installing project dependencies via $PKG_MANAGER...${NC}"
    if [ "$PKG_MANAGER" = "bun" ]; then
        bun install
    elif [ "$PKG_MANAGER" = "pnpm" ]; then
        pnpm install
    elif [ "$PKG_MANAGER" = "yarn" ]; then
        yarn install
    else
        npm install --legacy-peer-deps || npm install
    fi
    echo -e "${GREEN}✓ Dependencies installed successfully.${NC}"
else
    echo -e "${GREEN}✓ Dependencies already up to date in node_modules.${NC}"
fi

# 6. Check Port 3000 availability
PORT=3000
echo -e "\n${YELLOW}🔌 Checking port ${PORT}...${NC}"
if command -v lsof >/dev/null 2>&1; then
    PORT_PID=$(lsof -ti :$PORT || true)
    if [ -n "$PORT_PID" ]; then
        echo -e "${YELLOW}⚠️  Port $PORT is currently in use by process $PORT_PID. Stopping it...${NC}"
        kill -9 $PORT_PID >/dev/null 2>&1 || true
        sleep 1
    fi
fi

# 7. Detect Local IP address (for LAN preview on phone/tablet)
LOCAL_IP="localhost"
if command -v ip >/dev/null 2>&1; then
    LOCAL_IP=$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7}' || echo "localhost")
elif command -v ifconfig >/dev/null 2>&1; then
    LOCAL_IP=$(ifconfig | grep "inet " | grep -Fv 127.0.0.1 | awk '{print $2}' | head -n 1 || echo "localhost")
fi

echo -e "\n${GREEN}${BOLD}=================================================================="
echo "    ✨ Server Ready to Start!"
echo "==================================================================${NC}"
echo -e "You can copy and paste either of these URLs into any browser:"
echo -e "  🔗 ${BOLD}${CYAN}Local URL:   ${GREEN}http://localhost:${PORT}${NC}"
if [ "$LOCAL_IP" != "localhost" ] && [ -n "$LOCAL_IP" ]; then
    echo -e "  📱 ${BOLD}${CYAN}Network URL: ${GREEN}http://${LOCAL_IP}:${PORT}${NC} (access from phone/other devices)"
fi
echo -e "${BOLD}==================================================================${NC}"
echo -e "Press ${RED}${BOLD}Ctrl + C${NC} anytime to stop the server.\n"

# 8. Start the Next.js development server
if [ "$PKG_MANAGER" = "bun" ]; then
    exec bun run dev
elif [ "$PKG_MANAGER" = "pnpm" ]; then
    exec pnpm run dev
elif [ "$PKG_MANAGER" = "yarn" ]; then
    exec yarn dev
else
    exec npm run dev
fi
