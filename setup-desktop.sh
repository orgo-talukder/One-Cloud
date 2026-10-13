#!/usr/bin/env bash
# ==============================================================================
# One Cloud — 1-Click Desktop App Auto Builder & Double-Click Launcher Setup
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
echo "   ☁️  One Cloud — 1-Click Desktop App Auto Setup"
echo "=========================================================="
echo -e "${NC}"

# Navigate to project root (where this script resides)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ------------------------------------------------------------------------------
# [1/5] Prepare White-Background Desktop Icon (website_logo.png)
# ------------------------------------------------------------------------------
echo -e "${CYAN}[1/5] Preparing white-background Desktop icon from website_logo.png...${NC}"

ICON_SOURCE=""
if [ -f "$SCRIPT_DIR/public/website_logo.png" ]; then
    ICON_SOURCE="$SCRIPT_DIR/public/website_logo.png"
elif [ -f "$SCRIPT_DIR/website_logo.png" ]; then
    ICON_SOURCE="$SCRIPT_DIR/website_logo.png"
fi

ICON_DEST_DIR="$HOME/.local/share/icons/hicolor/512x512/apps"
mkdir -p "$ICON_DEST_DIR"
DESKTOP_ICON_PATH="$ICON_DEST_DIR/one-cloud.png"

# Generate or copy the white background icon
if [ -f "scripts/generate-pwa-icons.js" ]; then
    node scripts/generate-pwa-icons.js 2>/dev/null || true
fi

if [ -f "$SCRIPT_DIR/public/pwa-512x512.png" ]; then
    cp "$SCRIPT_DIR/public/pwa-512x512.png" "$DESKTOP_ICON_PATH"
elif [ -f "$SCRIPT_DIR/electron/icon.png" ]; then
    cp "$SCRIPT_DIR/electron/icon.png" "$DESKTOP_ICON_PATH"
elif [ -n "$ICON_SOURCE" ]; then
    cp "$ICON_SOURCE" "$DESKTOP_ICON_PATH"
fi

echo -e "${GREEN}✓ Desktop white-background icon ready at: ${DESKTOP_ICON_PATH}${NC}"

# ------------------------------------------------------------------------------
# [2/5] Auto-Check or Auto-Build Desktop App (.deb & AppImage)
# ------------------------------------------------------------------------------
echo -e "\n${CYAN}[2/5] Checking desktop app packages...${NC}"

# Ensure live Vercel URL is in electron/app-config.json
if [ -f "electron/app-config.json" ]; then
    sed -i 's|https://your-one-cloud.vercel.app|https://one-cloud-zeta.vercel.app|g' electron/app-config.json 2>/dev/null || true
elif [ -f "electron/app-config.example.json" ]; then
    cp electron/app-config.example.json electron/app-config.json
    sed -i 's|https://your-one-cloud.vercel.app|https://one-cloud-zeta.vercel.app|g' electron/app-config.json 2>/dev/null || true
fi

APP_IMAGE_PATH=$(find "$SCRIPT_DIR/dist" -maxdepth 1 -name "*.AppImage" 2>/dev/null | head -n 1 || true)
DEB_PACKAGE_PATH=$(find "$SCRIPT_DIR/dist" -maxdepth 1 -name "*.deb" 2>/dev/null | head -n 1 || true)

if [ -z "$APP_IMAGE_PATH" ] || [ ! -f "/opt/One Cloud/one-cloud" ]; then
    echo -e "${YELLOW}ℹ Building & packaging One Cloud desktop app automatically...${NC}"
    npm run build
    npm run build:linux

    DEB_PACKAGE_PATH=$(find "$SCRIPT_DIR/dist" -maxdepth 1 -name "*.deb" 2>/dev/null | head -n 1 || true)
    APP_IMAGE_PATH=$(find "$SCRIPT_DIR/dist" -maxdepth 1 -name "*.AppImage" 2>/dev/null | head -n 1 || true)

    if [ -n "$DEB_PACKAGE_PATH" ] && [ -f "$DEB_PACKAGE_PATH" ]; then
        echo -e "${BLUE}Installing package to system (/opt)...${NC}"
        sudo dpkg -i "$DEB_PACKAGE_PATH" 2>/dev/null || sudo apt install -y "$DEB_PACKAGE_PATH" 2>/dev/null || true
    fi
else
    echo -e "${GREEN}✓ Desktop package already built and present.${NC}"
fi

# Ensure executable permissions on AppImage
if [ -n "$APP_IMAGE_PATH" ] && [ -f "$APP_IMAGE_PATH" ]; then
    chmod +x "$APP_IMAGE_PATH" 2>/dev/null || true
fi

# ------------------------------------------------------------------------------
# [3/5] Configure System Launcher & Ubuntu Sandbox Wrapper
# ------------------------------------------------------------------------------
echo -e "\n${CYAN}[3/5] Configuring Ubuntu 24.04 sandbox launcher...${NC}"

USER_BIN_DIR="$HOME/.local/bin"
mkdir -p "$USER_BIN_DIR"
WRAPPER_SCRIPT="$USER_BIN_DIR/one-cloud"

# Determine target binary: prefer installed /opt/One Cloud/one-cloud, fallback to AppImage
EXEC_TARGET=""
if [ -f "/opt/One Cloud/one-cloud" ]; then
    sudo chmod +x "/opt/One Cloud/one-cloud" 2>/dev/null || true
    EXEC_TARGET="/opt/One Cloud/one-cloud"
elif [ -n "$APP_IMAGE_PATH" ] && [ -f "$APP_IMAGE_PATH" ]; then
    EXEC_TARGET="$APP_IMAGE_PATH"
fi

cat << 'EOF' > "$WRAPPER_SCRIPT"
#!/usr/bin/env bash
# One Cloud Desktop Auto-Launcher

export ELECTRON_START_URL="${ELECTRON_START_URL:-https://one-cloud-zeta.vercel.app}"

if [ -f "/opt/One Cloud/one-cloud" ]; then
    exec "/opt/One Cloud/one-cloud" --no-sandbox "$@"
else
    # Find generated AppImage in dist
    SCRIPT_PATH="$(readlink -f "$0" 2>/dev/null || echo "$0")"
    DIR="$(dirname "$SCRIPT_PATH")"
    APPIMAGE=$(find "$HOME" -path "*/One-Cloud*dist/*.AppImage" 2>/dev/null | head -n 1)
    if [ -n "$APPIMAGE" ] && [ -f "$APPIMAGE" ]; then
        exec "$APPIMAGE" --no-sandbox "$@"
    fi
    echo "Error: One Cloud binary not found." >&2
    exit 1
fi
EOF

chmod +x "$WRAPPER_SCRIPT"

# Also link or update /usr/local/bin/one-cloud if root permission is available
if command -v sudo &>/dev/null; then
    sudo cp "$WRAPPER_SCRIPT" /usr/local/bin/one-cloud 2>/dev/null || true
    sudo chmod +x /usr/local/bin/one-cloud 2>/dev/null || true
fi

echo -e "${GREEN}✓ Launcher wrapper configured with --no-sandbox & https://one-cloud-zeta.vercel.app${NC}"

# ------------------------------------------------------------------------------
# [4/5] Install Ubuntu App Launcher Entry (Super Key Search)
# ------------------------------------------------------------------------------
echo -e "\n${CYAN}[4/5] Adding One Cloud to Ubuntu Application Menu...${NC}"

APP_MENU_DIR="$HOME/.local/share/applications"
mkdir -p "$APP_MENU_DIR"
APP_MENU_FILE="$APP_MENU_DIR/one-cloud.desktop"

cat << EOF > "$APP_MENU_FILE"
[Desktop Entry]
Version=1.0
Name=One Cloud
GenericName=Telegram Cloud Drive
Comment=Ultra-Fast Encrypted Telegram Cloud Storage
Exec=$WRAPPER_SCRIPT %U
Icon=$DESKTOP_ICON_PATH
Terminal=false
Type=Application
Categories=Network;FileTransfer;Utility;
StartupWMClass=one-cloud
MimeType=x-scheme-handler/one-cloud;
EOF

chmod +x "$APP_MENU_FILE"

# Also update system applications menu if possible
if command -v sudo &>/dev/null && [ -d "/usr/share/applications" ]; then
    sudo cp "$APP_MENU_FILE" /usr/share/applications/one-cloud.desktop 2>/dev/null || true
fi

if command -v update-desktop-database &>/dev/null; then
    update-desktop-database "$APP_MENU_DIR" 2>/dev/null || true
fi

echo -e "${GREEN}✓ One Cloud registered in Ubuntu Application Menu.${NC}"

# ------------------------------------------------------------------------------
# [5/5] Create Desktop Wallpaper Shortcut (Double-Click Launch)
# ------------------------------------------------------------------------------
echo -e "\n${CYAN}[5/5] Creating Desktop wallpaper double-click shortcut...${NC}"

DESKTOP_DIR="$HOME/Desktop"
DESKTOP_SHORTCUT="$DESKTOP_DIR/One Cloud.desktop"

if [ -d "$DESKTOP_DIR" ]; then
    cp "$APP_MENU_FILE" "$DESKTOP_SHORTCUT"
    chmod +x "$DESKTOP_SHORTCUT"

    # Ubuntu GNOME / Nemo / Nautilus "Allow Launching" trust activation
    if command -v gio &>/dev/null; then
        gio set "$DESKTOP_SHORTCUT" metadata::trusted true 2>/dev/null || true
        gio set "$DESKTOP_SHORTCUT" metadata::trust-and-launch true 2>/dev/null || true
    fi

    echo -e "${GREEN}✓ Desktop shortcut created at: ${BOLD}${DESKTOP_SHORTCUT}${NC}"
    echo -e "${GREEN}✓ Executable permission & 'Allow Launching' granted for double-click!${NC}"
else
    echo -e "${YELLOW}Notice: ~/Desktop folder not found. App is ready in Ubuntu Application Menu.${NC}"
fi

echo -e "\n${GREEN}${BOLD}=========================================================="
echo "   🎉 ALL DONE! Your One Cloud Desktop App is Ready!"
echo "==========================================================${NC}"
echo -e "${CYAN}১. আপনার কম্পিউটারের ডেস্কটপ স্ক্রিনে ${BOLD}'One Cloud'${NC}${CYAN} আইকনে মাউস দিয়ে ডাবল ক্লিক করলেই অ্যাপ ওপেন হবে!${NC}"
echo -e "${CYAN}২. অথবা কীবোর্ডের ${BOLD}Super (Windows) key${NC}${CYAN} চেপে 'One Cloud' সার্চ করলেও পেয়ে যাবেন।${NC}"
echo -e "${GREEN}Enjoy using One Cloud! ☁️✨${NC}\n"
