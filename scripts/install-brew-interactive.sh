#!/bin/bash

# Interactive Homebrew installation script
# This mimics the Brower modal command but with user interaction for PATH configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🍺 Homebrew Installation Script${NC}"
echo ""

# Check if Homebrew is already installed
if command -v brew &> /dev/null; then
    echo -e "${GREEN}✅ Homebrew is already installed${NC}"
    echo "Version: $(brew --version | head -1)"
    echo ""
    echo -e "${YELLOW}Updating Homebrew...${NC}"
    brew update
else
    echo -e "${YELLOW}Installing Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Determine Homebrew prefix and shell RC file
    HOMEBREW_PREFIX="$(/opt/homebrew/bin/brew --prefix 2>/dev/null || /usr/local/bin/brew --prefix 2>/dev/null || echo /opt/homebrew)"
    SHELL_RCFILE="$([ -n "$ZSH_VERSION" ] && echo ~/.zshrc || ([ -n "$BASH_VERSION" ] && echo ~/.bashrc || echo ~/.profile))"
    
    echo ""
    echo -e "${GREEN}✅ Homebrew installed successfully!${NC}"
    echo ""
    
    # Check if PATH needs to be configured
    if ! grep -qs "eval \"\$(${HOMEBREW_PREFIX}/bin/brew shellenv)\"" "$SHELL_RCFILE"; then
        echo -e "${YELLOW}Homebrew needs to be added to your PATH.${NC}"
        echo ""
        echo "Would you like to add Homebrew to your PATH automatically?"
        echo "This will add the following line to $SHELL_RCFILE:"
        echo -e "${BLUE}  eval \"\$(${HOMEBREW_PREFIX}/bin/brew shellenv)\"${NC}"
        echo ""
        read -p "Add to PATH? [yes/no]: " ADD_TO_PATH
        
        if [[ "$ADD_TO_PATH" == "yes" || "$ADD_TO_PATH" == "y" ]]; then
            echo ""
            echo "Adding Homebrew to PATH..."
            # Add to shell RC file
            echo '' >> "$SHELL_RCFILE"
            echo "eval \"\$(${HOMEBREW_PREFIX}/bin/brew shellenv)\"" >> "$SHELL_RCFILE"
            
            echo -e "${GREEN}✅ Homebrew added to PATH${NC}"
            echo ""
            echo "Reloading shell configuration..."
            
            # Apply to current session
            eval "$(${HOMEBREW_PREFIX}/bin/brew shellenv)"
            
            # Try to reload the shell config
            if [ -n "$ZSH_VERSION" ]; then
                source ~/.zshrc 2>/dev/null || true
            elif [ -n "$BASH_VERSION" ]; then
                source ~/.bashrc 2>/dev/null || true
            else
                source ~/.profile 2>/dev/null || true
            fi
            
            echo -e "${GREEN}✅ Shell reloaded. Homebrew is ready to use!${NC}"
        else
            echo ""
            echo -e "${YELLOW}⚠️  Skipping PATH configuration${NC}"
            echo ""
            echo "To add Homebrew to your PATH later, run:"
            echo -e "${BLUE}  echo '' >> $SHELL_RCFILE${NC}"
            echo -e "${BLUE}  echo 'eval \"\$(${HOMEBREW_PREFIX}/bin/brew shellenv)\"' >> $SHELL_RCFILE${NC}"
            echo -e "${BLUE}  source $SHELL_RCFILE${NC}"
            echo ""
            echo "For this session, running: eval \"\$(${HOMEBREW_PREFIX}/bin/brew shellenv)\""
            # Still apply to current session
            eval "$(${HOMEBREW_PREFIX}/bin/brew shellenv)"
        fi
    else
        echo -e "${GREEN}✅ Homebrew is already in your PATH${NC}"
        # Apply to current session just in case
        eval "$(${HOMEBREW_PREFIX}/bin/brew shellenv)"
    fi
fi

# Check if packages were provided as arguments
if [ $# -gt 0 ]; then
    echo ""
    echo -e "${BLUE}Installing packages: $@${NC}"
    echo ""
    
    # Install all provided packages
    brew install "$@"
    
    echo ""
    echo -e "${GREEN}✅ Installation complete!${NC}"
else
    echo ""
    echo -e "${GREEN}✅ Homebrew is ready!${NC}"
    echo ""
    echo "You can now install packages with:"
    echo -e "${BLUE}  brew install <package-name>${NC}"
    echo "or"
    echo -e "${BLUE}  brew install --cask <app-name>${NC}"
fi