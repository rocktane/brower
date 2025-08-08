#!/bin/bash

# Test script to run inside the Tart VM - CASKS ONLY
# This tests only GUI applications (casks)

set -e

LOGFILE="$HOME/brower-test-casks-$(date +%Y%m%d-%H%M%S).log"
FAILURES_FILE="$HOME/brower-test-casks-failures-$(date +%Y%m%d-%H%M%S).txt"

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
    log "🧪 Brower Homebrew CASKS Test"
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
        
        # Install Homebrew
        log "Running Homebrew installation..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" < /dev/null >> "$LOGFILE" 2>&1
        
        # Add Homebrew to PATH
        if [[ -f "/opt/homebrew/bin/brew" ]]; then
            log "Adding Homebrew to PATH (Apple Silicon)..."
            # Add to .zshrc for future sessions
            echo '' >> "$HOME/.zshrc"
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> "$HOME/.zshrc"
            # Also add to .zprofile for compatibility
            echo '' >> "$HOME/.zprofile"
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> "$HOME/.zprofile"
            # Apply to current session
            eval "$(/opt/homebrew/bin/brew shellenv)"
            log "Homebrew added to PATH"
        elif [[ -f "/usr/local/bin/brew" ]]; then
            log "Adding Homebrew to PATH (Intel)..."
            # Add to .zshrc for future sessions
            echo '' >> "$HOME/.zshrc"
            echo 'eval "$(/usr/local/bin/brew shellenv)"' >> "$HOME/.zshrc"
            # Also add to .zprofile for compatibility
            echo '' >> "$HOME/.zprofile"
            echo 'eval "$(/usr/local/bin/brew shellenv)"' >> "$HOME/.zprofile"
            # Apply to current session
            eval "$(/usr/local/bin/brew shellenv)"
            log "Homebrew added to PATH"
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
    log "📍 Step 2: Testing GUI applications (casks) only..."
    log ""
    
    # Test a subset of cask apps for faster testing
    # These are some of the most popular apps from the Brower database
    declare -a APPS=(
        "rectangle|--cask rectangle|Rectangle - Window manager"
        "alt-tab|--cask alt-tab|Alt-Tab - Application switcher"
        "shottr|--cask shottr|Shottr - Screenshot tool"
        "iterm2|--cask iterm2|iTerm2 - Terminal emulator"
        "visual-studio-code|--cask visual-studio-code|VS Code - Code editor"
        "arc|--cask arc|Arc - Modern web browser"
        "notion|--cask notion|Notion - Notes & projects"
        "discord|--cask discord|Discord - Community chat"
        "slack|--cask slack|Slack - Team messaging"
        "figma|--cask figma|Figma - UI design tool"
        "vlc|--cask vlc|VLC - Media player"
        "the-unarchiver|--cask the-unarchiver|The Unarchiver - Archive utility"
        "maccy|--cask maccy|Maccy - Clipboard manager"
        "shottr|--cask shottr|Shottr - Screenshot tool"
        "alt-tab|--cask alt-tab|Alt-Tab - Application switcher"
    )
    
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
    
    log "📍 Step 3: Testing fonts with tap..."
    log ""
    
    # Test font installation
    test_command "brew tap homebrew/cask-fonts" "Adding fonts tap" true
    test_command "brew install --cask font-fira-code" "Fira Code font" true
    test_command "brew install --cask font-jetbrains-mono" "JetBrains Mono font" true
    
    log ""
    log "📍 Step 4: Verification..."
    log ""
    
    # List installed casks
    log "Installed casks: $(brew list --cask | wc -l | tr -d ' ')"
    
    log ""
    log "======================================"
    
    # Final report
    if [ $FAILED_TESTS -eq 0 ]; then
        log "${GREEN}✅ All cask tests passed successfully!${NC}"
        log "======================================"
    else
        log "${RED}⚠️  Some cask tests failed${NC}"
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
    log "- Test log: $LOGFILE"
    if [ $FAILED_TESTS -gt 0 ]; then
        log "- Failures log: $FAILURES_FILE"
    fi
    
    log ""
    log "🎉 Casks test complete!"
    
    # Exit with appropriate code
    if [ $FAILED_TESTS -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main