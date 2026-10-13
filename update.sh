#!/usr/bin/env bash
# ==============================================================================
# One Cloud — Automated GitHub Repository Updater (update.sh)
# ==============================================================================

set -e

# Terminal colors
BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}"
echo "=========================================================="
echo "   🔄  One Cloud — GitHub Source Code Auto Updater"
echo "=========================================================="
echo -e "${NC}"

# Navigate to project root (where this script resides)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

REPO_URL="https://github.com/orgo-talukder/One-Cloud"
BACKUP_DIR=".update_backup_$(date +%Y%m%d_%H%M%S)"

echo -e "${BLUE}📁 Project directory: ${SCRIPT_DIR}${NC}\n"

# ------------------------------------------------------------------------------
# [1/4] Safe Configuration Backup (.env & electron/app-config.json)
# ------------------------------------------------------------------------------
echo -e "${CYAN}[1/4] Securing your private API keys & configuration...${NC}"
mkdir -p "$BACKUP_DIR"

HAS_ENV=false
HAS_APP_CONFIG=false

if [ -f ".env" ]; then
    cp .env "$BACKUP_DIR/.env"
    HAS_ENV=true
    echo -e "${GREEN}✓ .env file backed up securely (Your Telegram & Firebase keys are 100% safe).${NC}"
fi

if [ -f "electron/app-config.json" ]; then
    mkdir -p "$BACKUP_DIR/electron"
    cp electron/app-config.json "$BACKUP_DIR/electron/app-config.json"
    HAS_APP_CONFIG=true
    echo -e "${GREEN}✓ electron/app-config.json backed up securely.${NC}"
fi

# ------------------------------------------------------------------------------
# [2/4] Checking for GitHub Updates
# ------------------------------------------------------------------------------
echo -e "\n${CYAN}[2/4] Checking for latest updates on GitHub...${NC}"

UPDATES_PULLED=false

if [ -d ".git" ] && command -v git &> /dev/null; then
    # Git-based repository workflow
    echo -e "${BLUE}ℹ Git repository detected. Checking remote updates...${NC}"
    
    # Configure remote if missing
    if ! git remote get-url origin &>/dev/null; then
        echo -e "${YELLOW}Setting git origin remote to: ${REPO_URL}.git${NC}"
        git remote add origin "${REPO_URL}.git" 2>/dev/null || true
    fi

    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
    [ "$CURRENT_BRANCH" = "HEAD" ] && CURRENT_BRANCH="main"

    echo -e "${BLUE}  Current branch: ${BOLD}${CURRENT_BRANCH}${NC}"
    echo -e "${BLUE}  Fetching from origin...${NC}"

    if git fetch origin "$CURRENT_BRANCH" --quiet 2>/dev/null; then
        LOCAL_HASH=$(git rev-parse HEAD 2>/dev/null || echo "local")
        REMOTE_HASH=$(git rev-parse "origin/$CURRENT_BRANCH" 2>/dev/null || echo "remote")

        if [ "$LOCAL_HASH" = "$REMOTE_HASH" ]; then
            echo -e "${GREEN}${BOLD}✓ কোনো নতুন আপডেট নেই! আপনার কোড ইতিমধ্যে সর্বশেষ আপ-টু-ডেট সংস্করণে রয়েছে।${NC}"
            echo -e "${GREEN}✓ Your local One Cloud repository is already up to date with GitHub.${NC}"
        else
            COMMITS_BEHIND=$(git rev-list --count HEAD.."origin/$CURRENT_BRANCH" 2>/dev/null || echo "some")
            echo -e "${YELLOW}🚀 নতুন আপডেট পাওয়া গেছে! (${COMMITS_BEHIND} commits behind)${NC}"
            echo -e "${BLUE}Applying updates from GitHub...${NC}"

            # Stash temporary local modifications if any
            git stash --quiet 2>/dev/null || true

            if git pull origin "$CURRENT_BRANCH" --ff-only 2>/dev/null || git pull origin "$CURRENT_BRANCH" 2>/dev/null; then
                UPDATES_PULLED=true
                echo -e "${GREEN}✓ Successfully pulled latest changes from GitHub!${NC}"
            else
                echo -e "${YELLOW}Notice: Merging updates...${NC}"
                git merge "origin/$CURRENT_BRANCH" --no-edit 2>/dev/null || true
                UPDATES_PULLED=true
            fi

            # Pop stash if any
            git stash pop --quiet 2>/dev/null || true
        fi
    else
        echo -e "${YELLOW}Warning: Could not fetch from git remote. Checking network connection...${NC}"
    fi

else
    # Standalone ZIP Folder Workflow (no .git folder)
    echo -e "${YELLOW}ℹ Standalone folder detected (not a git clone). Fetching latest archive from GitHub...${NC}"
    
    TEMP_ZIP="/tmp/one_cloud_latest_$$.zip"
    TEMP_EXTRACT="/tmp/one_cloud_extract_$$"

    if command -v curl &> /dev/null && command -v unzip &> /dev/null; then
        echo -e "${BLUE}Downloading latest source code from GitHub: ${REPO_URL}/archive/refs/heads/main.zip ...${NC}"
        
        if curl -fsSL "${REPO_URL}/archive/refs/heads/main.zip" -o "$TEMP_ZIP"; then
            mkdir -p "$TEMP_EXTRACT"
            unzip -q -o "$TEMP_ZIP" -d "$TEMP_EXTRACT"
            
            # The zip extracts into One-Cloud-main/
            EXTRACTED_SRC=$(find "$TEMP_EXTRACT" -maxdepth 1 -type d -name "One-Cloud*" | head -n 1)
            
            if [ -n "$EXTRACTED_SRC" ] && [ -d "$EXTRACTED_SRC" ]; then
                echo -e "${BLUE}Syncing updated files into your workspace...${NC}"
                
                # Copy updated files while preserving existing custom files
                cp -R "$EXTRACTED_SRC"/* "$SCRIPT_DIR/" 2>/dev/null || true
                cp -R "$EXTRACTED_SRC"/.[!.]* "$SCRIPT_DIR/" 2>/dev/null || true
                
                UPDATES_PULLED=true
                echo -e "${GREEN}✓ Successfully updated project files to latest GitHub release!${NC}"
            fi

            # Cleanup temporary zip
            rm -rf "$TEMP_ZIP" "$TEMP_EXTRACT"
        else
            echo -e "${RED}❌ Could not download archive from GitHub. Please verify your internet connection.${NC}"
        fi
    else
        echo -e "${YELLOW}Note: 'curl' or 'unzip' not found. Please install them or initialize git: sudo apt install -y curl unzip git${NC}"
    fi
fi

# ------------------------------------------------------------------------------
# [3/4] Restore Protected User Configuration
# ------------------------------------------------------------------------------
echo -e "\n${CYAN}[3/4] Restoring your private configuration & keys...${NC}"

if [ "$HAS_ENV" = true ] && [ -f "$BACKUP_DIR/.env" ]; then
    cp "$BACKUP_DIR/.env" .env
    echo -e "${GREEN}✓ Your .env file restored safely.${NC}"
fi

if [ "$HAS_APP_CONFIG" = true ] && [ -f "$BACKUP_DIR/electron/app-config.json" ]; then
    mkdir -p electron
    cp "$BACKUP_DIR/electron/app-config.json" electron/app-config.json
    echo -e "${GREEN}✓ Your electron/app-config.json restored safely.${NC}"
fi

# Clean up backup directory
rm -rf "$BACKUP_DIR"

# ------------------------------------------------------------------------------
# [4/4] Dependency & Build Check
# ------------------------------------------------------------------------------
echo -e "\n${CYAN}[4/4] Checking dependencies & file readiness...${NC}"

# If updates were pulled, run npm install to ensure any new npm packages are installed
if [ "$UPDATES_PULLED" = true ]; then
    echo -e "${BLUE}New updates detected! Checking npm dependencies...${NC}"
    if command -v npm &> /dev/null; then
        npm install --prefer-offline 2>/dev/null || npm install
        echo -e "${GREEN}✓ npm dependencies updated successfully.${NC}"
    fi
fi

# Make sure installer.sh and update.sh have executable permissions
chmod +x installer.sh 2>/dev/null || true
chmod +x update.sh 2>/dev/null || true

echo -e "\n${GREEN}${BOLD}=========================================================="
echo "   🎉 UPDATE COMPLETE / আপডেট সম্পন্ন হয়েছে!"
echo "==========================================================${NC}"

if [ "$UPDATES_PULLED" = true ]; then
    echo -e "${GREEN}✓ আপনার One Cloud প্রোজেক্টের কোড সফলভাবে GitHub থেকে আপডেট করা হয়েছে!${NC}"
    echo -e "${BLUE}ℹ নতুন আপডেট অনুযায়ী ডেস্কটপ অ্যাপ বিল্ড করতে টার্মিনালে রান করুন:${NC}"
    echo -e "   ${BOLD}bash installer.sh${NC}"
else
    echo -e "${GREEN}✓ আপনার কাছে ইতিমধ্যেই সর্বশেষ লেটেস্ট কোড রয়েছে। কোনো পরিবর্তনের প্রয়োজন নেই।${NC}"
fi

echo -e "\n${CYAN}All done! Have a great day! ☁️${NC}\n"
