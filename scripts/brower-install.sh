#!/bin/bash

# Brower-style Homebrew installation with interactive PATH configuration
# Usage: ./brower-install.sh [packages...]
# Example: ./brower-install.sh --cask firefox google-chrome stats

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to execute the Brower-style command
execute_brower_command() {
    local packages="$@"
    
    # Check if brew exists and update, or install it
    if command -v brew &> /dev/null; then
        echo -e "${YELLOW}Updating Homebrew...${NC}"
        brew update
    else
        echo -e "${YELLOW}Installing Homebrew...${NC}"
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # Determine Homebrew prefix and shell RC file
        HOMEBREW_PREFIX="$(/opt/homebrew/bin/brew --prefix 2>/dev/null || /usr/local/bin/brew --prefix 2>/dev/null || echo /opt/homebrew)"
        SHELL_RCFILE="$([ -n "$ZSH_VERSION" ] && echo ~/.zshrc || ([ -n "$BASH_VERSION" ] && echo ~/.bashrc || echo ~/.profile))"
        
        # Check if brew shellenv is already in the RC file
        if grep -qs "eval \"\$(${HOMEBREW_PREFIX}/bin/brew shellenv)\"" "$SHELL_RCFILE"; then
            if ! command -v brew >/dev/null; then
                echo ""
                echo -e "${YELLOW}Homebrew is installed but not in your current PATH.${NC}"
                echo "- Run this command in your terminal to add Homebrew to your PATH:"
                echo -e "${BLUE}    eval \"\$(${HOMEBREW_PREFIX}/bin/brew shellenv)\"${NC}"
                
                # Apply to current session
                eval "$(${HOMEBREW_PREFIX}/bin/brew shellenv)"
            fi
        else
            echo ""
            echo -e "${YELLOW}Homebrew needs to be added to your PATH.${NC}"
            echo ""
            read -p "Would you like to add Homebrew to your PATH? [yes/no]: " ADD_TO_PATH
            
            if [[ "$ADD_TO_PATH" == "yes" || "$ADD_TO_PATH" == "y" ]]; then
                echo ""
                echo "Adding Homebrew to PATH..."
                echo >> "$SHELL_RCFILE"
                echo "eval \"\$(${HOMEBREW_PREFIX}/bin/brew shellenv)\"" >> "$SHELL_RCFILE"
                
                # Apply to current session and reload
                eval "$(${HOMEBREW_PREFIX}/bin/brew shellenv)"
                source "$SHELL_RCFILE" 2>/dev/null || true
                
                echo -e "${GREEN}✅ Homebrew added to PATH and shell reloaded${NC}"
            else
                echo ""
                echo -e "${YELLOW}Skipping PATH configuration.${NC}"
                echo "- Run these commands in your terminal to add Homebrew to your PATH:"
                echo -e "${BLUE}    echo >> $SHELL_RCFILE${NC}"
                echo -e "${BLUE}    echo 'eval \"\$(${HOMEBREW_PREFIX}/bin/brew shellenv)\"' >> $SHELL_RCFILE${NC}"
                echo -e "${BLUE}    eval \"\$(${HOMEBREW_PREFIX}/bin/brew shellenv)\"${NC}"
                
                # Still apply to current session for package installation
                eval "$(${HOMEBREW_PREFIX}/bin/brew shellenv)"
            fi
        fi
    fi
    
    # Install packages if provided
    if [ -n "$packages" ]; then
        echo ""
        echo -e "${BLUE}Installing packages...${NC}"
        brew install $packages
        echo ""
        echo -e "${GREEN}✅ Installation complete!${NC}"
    else
        echo ""
        echo -e "${GREEN}✅ Homebrew is ready!${NC}"
    fi
}

# Main execution
if [ $# -eq 0 ]; then
    echo -e "${BLUE}Brower Homebrew Installer${NC}"
    echo ""
    echo "Usage: $0 [packages...]"
    echo ""
    echo "Examples:"
    echo "  $0 --cask firefox google-chrome"
    echo "  $0 git node python@3"
    echo "  $0 --cask stats rectangle raycast"
    echo ""
    echo "Or run without arguments to just install/update Homebrew:"
    echo "  $0"
    echo ""
    read -p "Continue with Homebrew installation? [yes/no]: " CONTINUE
    
    if [[ "$CONTINUE" == "yes" || "$CONTINUE" == "y" ]]; then
        execute_brower_command
    else
        echo "Installation cancelled."
        exit 0
    fi
else
    execute_brower_command "$@"
fi