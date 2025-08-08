#!/bin/bash

# Test script to run inside the Tart VM
# This simulates a new user installing apps via Brower

set -e

LOGFILE="$HOME/brower-test-$(date +%Y%m%d-%H%M%S).log"
FAILURES_FILE="$HOME/brower-test-failures-$(date +%Y%m%d-%H%M%S).txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
FAILED_APPS=()

# Logging function
log() {
    echo -e "$1" | tee -a "$LOGFILE"
}

# Test function - now continues on failure
test_command() {
    local cmd="$1"
    local description="$2"
    local allow_fail="${3:-false}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    log "${YELLOW}Testing: $description${NC}"
    log "Command: $cmd"
    
    if eval "$cmd" >> "$LOGFILE" 2>&1; then
        log "${GREEN}✅ Success${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        log "${RED}❌ Failed${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        FAILED_APPS+=("$description")
        echo "$description: $cmd" >> "$FAILURES_FILE"
        
        if [ "$allow_fail" = "false" ]; then
            # Critical failure, should exit
            return 1
        fi
        return 0
    fi
}

# Main test sequence
main() {
    log "======================================"
    log "🧪 Brower Homebrew Installation Test"
    log "======================================"
    log "Date: $(date)"
    log "System: $(sw_vers)"
    log ""
    
    # Check if Homebrew is installed
    log "📍 Step 1: Checking Homebrew installation..."
    if command -v brew &> /dev/null; then
        log "${GREEN}✅ Homebrew is already installed${NC}"
        log "Version: $(brew --version | head -1)"
    else
        log "${YELLOW}⚠️  Homebrew not found. Installing...${NC}"
        
        # Install Homebrew (simulating the Brower modal command)
        log "Running Homebrew installation..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" < /dev/null >> "$LOGFILE" 2>&1
        
        # Determine Homebrew prefix and shell RC file
        HOMEBREW_PREFIX="$(/opt/homebrew/bin/brew --prefix 2>/dev/null || /usr/local/bin/brew --prefix 2>/dev/null || echo /opt/homebrew)"
        SHELL_RCFILE="$([ -n "$ZSH_VERSION" ] && echo ~/.zshrc || ([ -n "$BASH_VERSION" ] && echo ~/.bashrc || echo ~/.profile))"
        
        # Check if PATH needs to be configured
        if ! grep -qs "eval \"\$(${HOMEBREW_PREFIX}/bin/brew shellenv)\"" "$SHELL_RCFILE"; then
            log "${YELLOW}Homebrew needs to be added to PATH${NC}"
            log "Would you like to add Homebrew to your PATH? (yes/no)"
            
            # For automated testing, default to yes
            # In a real interactive session, this would wait for user input
            read -t 5 -p "Add to PATH? [yes]: " ADD_TO_PATH || ADD_TO_PATH="yes"
            
            if [[ "$ADD_TO_PATH" == "yes" || "$ADD_TO_PATH" == "y" || "$ADD_TO_PATH" == "" ]]; then
                log "Adding Homebrew to PATH..."
                # Add to shell RC file
                echo '' >> "$SHELL_RCFILE"
                echo "eval \"\$(${HOMEBREW_PREFIX}/bin/brew shellenv)\"" >> "$SHELL_RCFILE"
                # Apply to current session
                eval "$(${HOMEBREW_PREFIX}/bin/brew shellenv)"
                log "${GREEN}✅ Homebrew added to PATH${NC}"
                log "Reloading shell configuration..."
                source "$SHELL_RCFILE" 2>/dev/null || true
            else
                log "${YELLOW}⚠️  Skipping PATH configuration${NC}"
                log "You can add it later with:"
                log "  echo 'eval \"\$(${HOMEBREW_PREFIX}/bin/brew shellenv)\"' >> $SHELL_RCFILE"
                # Still apply to current session for this test
                eval "$(${HOMEBREW_PREFIX}/bin/brew shellenv)"
            fi
        else
            log "Homebrew already in PATH"
            # Apply to current session
            eval "$(${HOMEBREW_PREFIX}/bin/brew shellenv)"
        fi
        
        # Verify installation
        if command -v brew &> /dev/null; then
            log "${GREEN}✅ Homebrew installed successfully${NC}"
        else
            log "${RED}❌ Homebrew installation failed${NC}"
            exit 1
        fi
    fi
    
    log ""
    log "📍 Step 2: Testing CLI tools (formulae) first..."
    log ""
    
    # Test CLI tools first (faster, fewer dependencies)
    CLI_TOOLS=(
        "git|Git version control"
        "node|Node.js runtime"
        "python@3.12|Python 3.12"
        "wget|Download tool"
        "jq|JSON processor"
        "ripgrep|Fast grep"
        "fd|Fast find"
        "bat|Better cat"
        "eza|Better ls"
        "htop|Process viewer"
        "gh|GitHub CLI"
        "tree|Directory tree viewer"
        "tldr|Simplified man pages"
        "httpie|HTTP client"
        "neovim|Modern vim"
    )
    
    for tool_entry in "${CLI_TOOLS[@]}"; do
        IFS='|' read -r tool description <<< "$tool_entry"
        test_command "brew install $tool" "$description" true
        log ""
    done
    
    log "📍 Step 3: Testing fonts with tap..."
    log ""
    
    # Test font installation
    test_command "brew tap homebrew/cask-fonts" "Adding fonts tap" true
    test_command "brew install --cask font-fira-code" "Fira Code font" true
    test_command "brew install --cask font-jetbrains-mono" "JetBrains Mono font" true
    
    log ""
    log "📍 Step 4: Testing all Brower cask apps from db.json..."
    log ""
    
    # Test all cask apps from the Brower database
    # These are extracted from public/db.json
    declare -a APPS=(
        "aldente|--cask aldente|AlDente - Battery charge manager"
        "alfred|--cask alfred|Alfred - Command launcher"
        "alt-tab|--cask alt-tab|Alt-Tab - Application switcher"
        "arc|--cask arc|Arc - Modern web browser"
        "balenaetcher|--cask balenaetcher|BalenaEtcher - SD card flasher"
        "battery|--cask battery|Battery - Battery monitor"
        "beeper|--cask beeper|Beeper - Unified messaging"
        "bitwarden|--cask bitwarden|Bitwarden - Password manager"
        "brave-browser|--cask brave-browser|Brave - Privacy browser"
        "bruno|--cask bruno|Bruno - API client"
        "coconutbattery|--cask coconutbattery|CoconutBattery - Battery monitor"
        "coteditor|--cask coteditor|CotEditor - Text editor"
        "discord|--cask discord|Discord - Community chat"
        "ente-auth|--cask ente-auth|Ente - 2FA manager"
        "ferdium|--cask ferdium|Ferdium - Unified messaging"
        "figma|--cask figma|Figma - UI design tool"
        "firefox|--cask firefox|Firefox - Open source browser"
        "google-chrome|--cask google-chrome|Google Chrome - Web browser"
        "google-drive|--cask google-drive|Google Drive - Cloud storage"
        "jordanbaird-ice|--cask jordanbaird-ice|ICE - Menu bar manager"
        "iina|--cask iina|IINA - Media player"
        "iterm2|--cask iterm2|iTerm2 - Terminal emulator"
        "itsycal|--cask itsycal|Itsycal - Menu bar calendar"
        "latest|--cask latest|Latest - Update checker"
        "lulu|--cask lulu|LuLu - Firewall"
        "maccy|--cask maccy|Maccy - Clipboard manager"
        "notion|--cask notion|Notion - Notes & projects"
        "obsidian|--cask obsidian|Obsidian - Knowledge base"
        "orion|--cask orion|Orion - Safari alternative"
        "raycast|--cask raycast|Raycast - Productivity launcher"
        "rectangle|--cask rectangle|Rectangle - Window manager"
        "scroll-reverser|--cask scroll-reverser|Scroll Reverser - Mouse settings"
        "setapp|--cask setapp|Setapp - App subscription"
        "shottr|--cask shottr|Shottr - Screenshot tool"
        "signal|--cask signal|Signal - Secure messaging"
        "slack|--cask slack|Slack - Team messaging"
        "sonos|--cask sonos|Sonos - Speaker manager"
        "stats|--cask stats|Stats - System monitor"
        "telegram|--cask telegram|Telegram - Messaging app"
        "the-unarchiver|--cask the-unarchiver|The Unarchiver - Archive utility"
        "transmission|--cask transmission|Transmission - BitTorrent client"
        "visual-studio-code|--cask visual-studio-code|VS Code - Code editor"
        "vlc|--cask vlc|VLC - Media player"
        "warp|--cask warp|Warp - AI terminal"
        "whatsapp|--cask whatsapp|WhatsApp - Messaging"
        "zed|--cask zed|Zed - Fast editor"
    )
    
    # Special case: Zen browser with tap
    APPS+=("zen-browser|--cask zen-browser|Zen Browser|zen-browser/browser https://github.com/zen-browser/desktop.git")
    
    # Test each app
    for app_entry in "${APPS[@]}"; do
        IFS='|' read -r app_name brew_cmd description tap_cmd <<< "$app_entry"
        
        # Handle tap if present
        if [ -n "$tap_cmd" ]; then
            log "${BLUE}Adding tap: $tap_cmd${NC}"
            brew tap $tap_cmd >> "$LOGFILE" 2>&1 || true
        fi
        
        # Test the app installation (continue on failure)
        test_command "brew install $brew_cmd" "$description" true
        log ""
    done
    
    log "📍 Step 5: Verification..."
    log ""
    
    # List installed casks
    log "Installed casks: $(brew list --cask | wc -l | tr -d ' ')"
    log "Installed formulae: $(brew list --formula | wc -l | tr -d ' ')"
    
    log ""
    log "======================================"
    
    # Final report
    if [ $FAILED_TESTS -eq 0 ]; then
        log "${GREEN}✅ All tests passed successfully!${NC}"
        log "======================================"
    else
        log "${RED}⚠️  Some tests failed${NC}"
        log "======================================"
        log ""
        log "📊 Test Summary:"
        log "- Total tests: $TOTAL_TESTS"
        log "- Passed: ${GREEN}$PASSED_TESTS${NC}"
        log "- Failed: ${RED}$FAILED_TESTS${NC}"
        log ""
        log "${RED}Failed installations:${NC}"
        for failed in "${FAILED_APPS[@]}"; do
            log "  ❌ $failed"
        done
        log ""
        log "See $FAILURES_FILE for details"
    fi
    
    log ""
    log "📊 Final Summary:"
    log "- Homebrew: $(brew --version | head -1)"
    log "- Casks installed: $(brew list --cask | wc -l | tr -d ' ')"
    log "- Formulae installed: $(brew list --formula | wc -l | tr -d ' ')"
    log "- Test log: $LOGFILE"
    if [ $FAILED_TESTS -gt 0 ]; then
        log "- Failures log: $FAILURES_FILE"
    fi
    
    log ""
    log "🎉 Test complete!"
    
    # Exit with appropriate code
    if [ $FAILED_TESTS -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main