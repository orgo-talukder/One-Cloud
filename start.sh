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

# 3. Detect Package Manager (Prefer Bun if available, else pnpm/npm)
PKG_MANAGER="npm"
if command -v bun >/dev/null 2>&1; then
    PKG_MANAGER="bun"
elif command -v pnpm >/dev/null 2>&1; then
    PKG_MANAGER="pnpm"
fi
echo -e "${GREEN}✓ Package Manager selected:${NC} $PKG_MANAGER"

# 4. Check & Prepare .env.local
echo -e "\n${YELLOW}⚙️  Verifying environment variables...${NC}"
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}ℹ️  .env.local not found. Initializing from .env.example...${NC}"
        cp .env.example .env.local
        
        # Populate Firebase default config from firebase-applet-config.json if present
        if [ -f "firebase-applet-config.json" ]; then
            echo -e "${GREEN}✓ Syncing default Firebase config from firebase-applet-config.json...${NC}"
            API_KEY=$(grep -o '"apiKey": *"[^"]*"' firebase-applet-config.json | head -1 | cut -d '"' -f 4 || true)
            AUTH_DOMAIN=$(grep -o '"authDomain": *"[^"]*"' firebase-applet-config.json | head -1 | cut -d '"' -f 4 || true)
            PROJECT_ID=$(grep -o '"projectId": *"[^"]*"' firebase-applet-config.json | head -1 | cut -d '"' -f 4 || true)
            STORAGE_BUCKET=$(grep -o '"storageBucket": *"[^"]*"' firebase-applet-config.json | head -1 | cut -d '"' -f 4 || true)
            MESSAGING_ID=$(grep -o '"messagingSenderId": *"[^"]*"' firebase-applet-config.json | head -1 | cut -d '"' -f 4 || true)
            APP_ID=$(grep -o '"appId": *"[^"]*"' firebase-applet-config.json | head -1 | cut -d '"' -f 4 || true)
            DB_ID=$(grep -o '"firestoreDatabaseId": *"[^"]*"' firebase-applet-config.json | head -1 | cut -d '"' -f 4 || true)

            cat <<EOF >> .env.local
NEXT_PUBLIC_FIREBASE_API_KEY="$API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="$AUTH_DOMAIN"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="$PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="$STORAGE_BUCKET"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="$MESSAGING_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="$APP_ID"
NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID="$DB_ID"
EOF
        fi
        echo -e "${GREEN}✓ .env.local created successfully.${NC}"
    fi
else
    echo -e "${GREEN}✓ .env.local is present.${NC}"
fi

# 5. Check dependencies / node_modules
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo -e "\n${YELLOW}📦 Installing project dependencies via $PKG_MANAGER...${NC}"
    if [ "$PKG_MANAGER" = "bun" ]; then
        bun install
    elif [ "$PKG_MANAGER" = "pnpm" ]; then
        pnpm install
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
else
    exec npm run dev
fi
