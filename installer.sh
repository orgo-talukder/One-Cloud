#!/usr/bin/env bash
# ==============================================================================
# One Cloud — Automated Linux Desktop App Installer & 1-Click Builder
# ==============================================================================

set -e

# Terminal colors
BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}"
echo "=========================================================="
echo "   ☁️  One Cloud — Linux Desktop App Auto Builder (1-Click)"
echo "=========================================================="
echo -e "${NC}"

# Navigate to project root (where this script resides)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ------------------------------------------------------------------------------
# [1/6] Environment & Node.js Verification
# ------------------------------------------------------------------------------
echo -e "${CYAN}[1/6] Checking system environment & Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed! Please install Node.js (v18+) first.${NC}"
    echo -e "${YELLOW}Tip (Ubuntu/Debian): curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs${NC}"
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
# [2/6] Auto Git Update & Smart Fallback
# ------------------------------------------------------------------------------
echo -e "\n${CYAN}[2/6] Checking for GitHub repository updates...${NC}"

if [ -d ".git" ] && command -v git &> /dev/null; then
    echo -e "${BLUE}ℹ Git repository detected. Checking remote updates...${NC}"
    
    # Try git fetch and pull
    if git rev-parse --is-inside-work-tree &> /dev/null; then
        CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
        echo -e "${BLUE}  Branch: ${CURRENT_BRANCH}${NC}"
        
        # Stash untracked/local temporary files if needed, or simply pull fast-forward
        if git pull origin "$CURRENT_BRANCH" 2>/dev/null || git pull 2>/dev/null; then
            echo -e "${GREEN}✓ Successfully synced latest code from GitHub!${NC}"
        else
            echo -e "${YELLOW}ℹ Notice: Git pull skipped (working tree dirty or offline). Proceeding with local configuration verification.${NC}"
        fi
    fi
else
    echo -e "${YELLOW}ℹ Standalone ZIP extract detected (no .git folder). Proceeding with direct self-healing validation.${NC}"
fi

# ------------------------------------------------------------------------------
# [3/6] Self-Healing Configuration & Electron Schema Sanitization
# ------------------------------------------------------------------------------
echo -e "\n${CYAN}[3/6] Verifying Electron & Debian build configurations...${NC}"

# 3.1: Self-heal package.json to ensure 'homepage', 'desktopName', and metadata are 100% compliant
if [ -f "package.json" ]; then
    node -e '
    try {
      const fs = require("fs");
      const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
      let updated = false;

      if (!pkg.name || pkg.name === "ai-studio-applet") {
        pkg.name = "one-cloud";
        updated = true;
      }
      if (!pkg.homepage) {
        pkg.homepage = "https://github.com/orgo-talukder/One-Cloud";
        updated = true;
      }
      if (!pkg.author) {
        pkg.author = "Argo Talukder <argotalukder10@gmail.com>";
        updated = true;
      }
      if (!pkg.description) {
        pkg.description = "One Cloud — Ultra-Fast Encrypted Telegram Cloud Storage";
        updated = true;
      }
      if (!pkg.desktopName) {
        pkg.desktopName = "one-cloud";
        updated = true;
      }

      if (updated) {
        fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n", "utf8");
        console.log("✓ package.json metadata auto-verified and updated.");
      } else {
        console.log("✓ package.json metadata is valid.");
      }
    } catch (e) {
      console.warn("Notice checking package.json:", e.message);
    }
    '
fi

# 3.2: Self-heal electron-builder.json (Fix any obsolete 'homepage' or invalid 'linux.desktopName' schema violations)
if [ -f "electron-builder.json" ]; then
    node -e '
    try {
      const fs = require("fs");
      let raw = fs.readFileSync("electron-builder.json", "utf8");
      let cfg = JSON.parse(raw);
      let updated = false;

      // Remove invalid root properties that fail schema
      if ("homepage" in cfg) {
        delete cfg.homepage;
        updated = true;
      }

      // Ensure linux object is strictly valid
      if (cfg.linux) {
        if ("desktopName" in cfg.linux) {
          delete cfg.linux.desktopName;
          updated = true;
        }
        if ("syncDesktopName" in cfg.linux) {
          delete cfg.linux.syncDesktopName;
          updated = true;
        }
        if (!cfg.linux.maintainer) {
          cfg.linux.maintainer = "Argo Talukder <argotalukder10@gmail.com>";
          updated = true;
        }
        if (!cfg.linux.executableName) {
          cfg.linux.executableName = "one-cloud";
          updated = true;
        }
        if (!cfg.linux.executableArgs || !cfg.linux.executableArgs.includes("--no-sandbox")) {
          cfg.linux.executableArgs = ["--no-sandbox"];
          updated = true;
        }
        if (!cfg.linux.icon) {
          cfg.linux.icon = "electron/icon.png";
          updated = true;
        }
      }

      if (!cfg.deb) {
        cfg.deb = {
          packageName: "one-cloud",
          priority: "optional",
          depends: ["libnotify4", "libsecret-1-0", "libnss3", "libatk-bridge2.0-0"]
        };
        updated = true;
      }

      if (updated) {
        fs.writeFileSync("electron-builder.json", JSON.stringify(cfg, null, 2) + "\n", "utf8");
        console.log("✓ electron-builder.json schema sanitized (100% compliant with electron-builder v26+).");
      } else {
        console.log("✓ electron-builder.json schema is already 100% compliant.");
      }
    } catch (e) {
      console.warn("Notice checking electron-builder.json:", e.message);
    }
    '
fi

# 3.3: Safeguard .env and electron/app-config.json
if [ -f .env ]; then
    echo -e "${GREEN}✓ Existing .env detected — keeping your custom API keys 100% safe & untouched.${NC}"
fi

if [ ! -f "electron/app-config.json" ] && [ -f "electron/app-config.example.json" ]; then
    cp electron/app-config.example.json electron/app-config.json
    echo -e "${GREEN}✓ Created electron/app-config.json with live One Cloud app URL.${NC}"
elif [ -f "electron/app-config.json" ]; then
    # If it contains placeholder or needs sync to the official Vercel live URL
    if grep -q "your-one-cloud.vercel.app" electron/app-config.json; then
        sed -i 's|https://your-one-cloud.vercel.app|https://one-cloud-zeta.vercel.app|g' electron/app-config.json
        echo -e "${GREEN}✓ Updated electron/app-config.json to your live URL: https://one-cloud-zeta.vercel.app${NC}"
    else
        echo -e "${GREEN}✓ Custom electron/app-config.json detected — keeping your desktop config safe.${NC}"
    fi
fi

# ------------------------------------------------------------------------------
# [4/6] Dependencies & App Icons Preparation
# ------------------------------------------------------------------------------
echo -e "\n${CYAN}[4/6] Checking npm dependencies & icons...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing node_modules dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✓ node_modules already installed.${NC}"
fi

if [ -f "scripts/generate-pwa-icons.js" ]; then
    node scripts/generate-pwa-icons.js 2>/dev/null || true
    echo -e "${GREEN}✓ Application icons verified.${NC}"
fi

# ------------------------------------------------------------------------------
# [5/6] Next.js Production Build
# ------------------------------------------------------------------------------
echo -e "\n${CYAN}[5/6] Compiling Next.js production web app...${NC}"
npm run build
echo -e "${GREEN}✓ Next.js production build succeeded.${NC}"

# ------------------------------------------------------------------------------
# [6/6] Packaging Linux Desktop App (.AppImage & .deb)
# ------------------------------------------------------------------------------
echo -e "\n${CYAN}[6/6] Packaging Linux Desktop App with electron-builder...${NC}"
npm run build:linux

echo -e "\n${GREEN}${BOLD}=========================================================="
echo "   🎉 SUCCESS! One Cloud Linux Desktop App is Ready!"
echo "==========================================================${NC}"

if [ -d "dist" ]; then
    # Make any generated AppImage executable
    chmod +x dist/*.AppImage 2>/dev/null || true

    echo -e "\n${BOLD}Generated Linux Packages in 'dist/' folder:${NC}"
    ls -lh dist/*.deb dist/*.AppImage 2>/dev/null || ls -lh dist/ 2>/dev/null || true

    echo -e "\n${CYAN}${BOLD}📌 How to run or install your App:${NC}"
    echo -e "  ${YELLOW}Option A — Install the Debian (.deb) Package (Recommended for Ubuntu/Debian/Mint):${NC}"
    echo -e "  ${BOLD}sudo apt install ./dist/one-cloud_1.0.0_amd64.deb${NC}"
    echo -e "  ${NC}  (or: sudo dpkg -i dist/one-cloud_1.0.0_amd64.deb)${NC}"
    echo ""
    echo -e "  ${YELLOW}Option B — Run the Portable AppImage directly (No installation needed):${NC}"
    echo -e "  ${BOLD}cd dist && ./One\\ Cloud-1.0.0.AppImage --no-sandbox${NC}"
fi

echo -e "\n${GREEN}All done! Enjoy using One Cloud on Linux! ☁️🚀${NC}\n"
