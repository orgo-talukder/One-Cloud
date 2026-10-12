#!/usr/bin/env bash
# ==============================================================================
# One Cloud — Automated Linux Desktop App Installer & Builder
# ==============================================================================

set -e

# Terminal colors
BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}"
echo "=========================================================="
echo "   ☁️  One Cloud — Linux Desktop App Auto Builder"
echo "=========================================================="
echo -e "${NC}"

# Navigate to project root (where this script resides)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${CYAN}[1/5] Checking environment & Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed! Please install Node.js (v18+) first.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ Error: npm is not installed!${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ Node.js: ${NODE_VERSION} | npm: ${NPM_VERSION}${NC}"

# ------------------------------------------------------------------------------
# .env Verification (NEVER overwrite, recreate or modify user's .env file)
# ------------------------------------------------------------------------------
if [ -f .env ]; then
    echo -e "${GREEN}✓ আপনার তৈরি করা .env ফাইল পাওয়া গেছে!${NC}"
    echo -e "${GREEN}✓ Existing .env detected — keeping your API keys 100% safe & untouched.${NC}"
    echo -e "${CYAN}ℹ Notice: .env ফাইলটি নতুন করে তৈরি বা পরিবর্তন করা হবে না।${NC}"
else
    echo -e "${YELLOW}ℹ Warning: .env ফাইল পাওয়া যায়নি। অনুগ্রহ করে আপনার API Keys সহ .env ফাইল তৈরি করে রাখুন।${NC}"
fi

# Step 2: Dependencies
echo -e "\n${CYAN}[2/5] Checking npm dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies (this may take a couple of minutes)...${NC}"
    npm install
else
    echo -e "${GREEN}✓ node_modules already installed. Skipping full re-install.${NC}"
fi

# Step 3: Generate Desktop & App Icons (with white background)
echo -e "\n${CYAN}[3/5] Generating white-background app icons...${NC}"
if [ -f "scripts/generate-pwa-icons.js" ]; then
    node scripts/generate-pwa-icons.js
    echo -e "${GREEN}✓ Desktop & Mobile icons successfully prepared.${NC}"
fi

# Step 4: Next.js Production Build
echo -e "\n${CYAN}[4/5] Building Next.js production web app...${NC}"
npm run build
echo -e "${GREEN}✓ Next.js build completed successfully.${NC}"

# Step 5: Packaging Linux Desktop App (.AppImage & .deb)
echo -e "\n${CYAN}[5/5] Packaging Linux Desktop App (electron-builder)...${NC}"
npm run build:linux

echo -e "\n${GREEN}${BOLD}=========================================================="
echo "   🎉 SUCCESS! Linux Desktop App is Ready!"
echo "==========================================================${NC}"

if [ -d "dist" ]; then
    # Make any generated AppImage executable
    chmod +x dist/*.AppImage 2>/dev/null || true

    echo -e "\n${BOLD}Generated Linux Packages in 'dist/' folder:${NC}"
    ls -lh dist/*.AppImage dist/*.deb 2>/dev/null || true

    echo -e "\n${CYAN}${BOLD}📌 How to run your App:${NC}"
    echo -e "  ${YELLOW}Option A (Portable AppImage - recommended):${NC}"
    echo -e "  cd dist && ./one-cloud-*.AppImage --no-sandbox"
    echo ""
    echo -e "  ${YELLOW}Option B (Install .deb on Ubuntu/Debian):${NC}"
    echo -e "  sudo dpkg -i dist/one-cloud_*.deb"
fi

echo -e "\n${GREEN}All done! Enjoy using One Cloud on Linux Desktop! ☁️${NC}"
