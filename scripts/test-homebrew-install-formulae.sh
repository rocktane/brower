#!/bin/bash

# Test script to run inside the Tart VM - FORMULAE ONLY
# This tests only CLI tools (formulae)

set -e

LOGFILE="$HOME/brower-test-formulae-$(date +%Y%m%d-%H%M%S).log"
FAILURES_FILE="$HOME/brower-test-formulae-failures-$(date +%Y%m%d-%H%M%S).txt"

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
    log "🧪 Brower Homebrew FORMULAE Test"
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
    log "📍 Step 2: Testing CLI tools (formulae) only..."
    log ""
    
    # Test CLI tools
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
        "ffmpeg|Media converter"
        "youtube-dl|Video downloader"
        "imagemagick|Image processor"
        "pandoc|Document converter"
        "tmux|Terminal multiplexer"
    )
    
    for tool_entry in "${CLI_TOOLS[@]}"; do
        IFS='|' read -r tool description <<< "$tool_entry"
        test_command "brew install $tool" "$description" true
        log ""
    done
    
    log "📍 Step 3: Verification..."
    log ""
    
    # List installed formulae
    log "Installed formulae: $(brew list --formula | wc -l | tr -d ' ')"
    
    log ""
    log "======================================"
    
    # Final report
    if [ $FAILED_TESTS -eq 0 ]; then
        log "${GREEN}✅ All formulae tests passed successfully!${NC}"
        log "======================================"
    else
        log "${RED}⚠️  Some formulae tests failed${NC}"
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
    log "- Formulae installed: $(brew list --formula | wc -l | tr -d ' ')"
    log "- Test log: $LOGFILE"
    if [ $FAILED_TESTS -gt 0 ]; then
        log "- Failures log: $FAILURES_FILE"
    fi
    
    log ""
    log "🎉 Formulae test complete!"
    
    # Exit with appropriate code
    if [ $FAILED_TESTS -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main