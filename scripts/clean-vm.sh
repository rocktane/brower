#!/bin/bash

# Script to clean a VM by removing Homebrew and all installed packages
# This runs INSIDE the VM to create a truly clean state

# SAFETY CHECK: Prevent accidental execution on host machine
if [ -z "$VM_ENVIRONMENT" ] && [ ! -f "/tmp/vm-clean-authorized" ]; then
    echo "⚠️  SAFETY STOP: This script is designed to run INSIDE a VM only!"
    echo "It will remove Homebrew and all packages from the system."
    echo ""
    echo "If you really want to run this on the current system:"
    echo "1. Create authorization file: touch /tmp/vm-clean-authorized"
    echo "2. Run the script again"
    echo ""
    echo "The authorization file will be automatically deleted after execution."
    exit 1
fi

echo "🧹 Cleaning VM to create pristine macOS state..."

# Check if Homebrew is installed
if command -v brew &> /dev/null; then
    echo "📦 Homebrew found. Removing all packages and Homebrew itself..."
    
    # Get Homebrew prefix
    BREW_PREFIX=$(brew --prefix)
    
    # List all installed packages for reference
    echo "Installed casks: $(brew list --cask 2>/dev/null | wc -l | tr -d ' ')"
    echo "Installed formulae: $(brew list --formula 2>/dev/null | wc -l | tr -d ' ')"
    
    # Remove all casks
    if [ "$(brew list --cask 2>/dev/null | wc -l | tr -d ' ')" -gt 0 ]; then
        echo "Removing all casks..."
        brew list --cask | xargs brew uninstall --cask --force 2>/dev/null || true
    fi
    
    # Remove all formulae
    if [ "$(brew list --formula 2>/dev/null | wc -l | tr -d ' ')" -gt 0 ]; then
        echo "Removing all formulae..."
        brew list --formula | xargs brew uninstall --force 2>/dev/null || true
    fi
    
    # Remove Homebrew itself
    echo "🗑️ Uninstalling Homebrew completely..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/uninstall.sh)" --force </dev/null || true
    
    # Clean up Homebrew directories
    echo "Cleaning up Homebrew directories..."
    sudo rm -rf /opt/homebrew 2>/dev/null || true
    sudo rm -rf /usr/local/Homebrew 2>/dev/null || true
    sudo rm -rf /usr/local/Caskroom 2>/dev/null || true
    sudo rm -rf /usr/local/bin/brew 2>/dev/null || true
    sudo rm -rf /Library/Caches/Homebrew 2>/dev/null || true
    sudo rm -rf ~/Library/Caches/Homebrew 2>/dev/null || true
    
    # Remove from PATH in shell profiles
    echo "Cleaning shell profiles..."
    sed -i.bak '/homebrew/d' ~/.zprofile 2>/dev/null || true
    sed -i.bak '/homebrew/d' ~/.bash_profile 2>/dev/null || true
    sed -i.bak '/homebrew/d' ~/.profile 2>/dev/null || true
    rm -f ~/.zprofile.bak ~/.bash_profile.bak ~/.profile.bak 2>/dev/null || true
    
    echo "✅ Homebrew completely removed"
else
    echo "✅ Homebrew not found - system is already clean"
fi

# Clear any other package managers or tools that might be installed
echo "🧹 Cleaning other potential installations..."

# Clear npm global packages if Node exists
if command -v npm &> /dev/null; then
    echo "Removing global npm packages..."
    npm list -g --depth=0 2>/dev/null | grep -v npm | awk -F/ '/node_modules/ && !/npm/ {print $NF}' | xargs npm uninstall -g 2>/dev/null || true
fi

# Clear pip packages if Python exists
if command -v pip3 &> /dev/null; then
    echo "Removing pip packages..."
    pip3 freeze 2>/dev/null | xargs pip3 uninstall -y 2>/dev/null || true
fi

# Clean up common directories
echo "Cleaning up common directories..."
rm -rf ~/Downloads/* 2>/dev/null || true
rm -rf ~/Desktop/* 2>/dev/null || true
rm -rf ~/.Trash/* 2>/dev/null || true

# Clear bash history
echo "Clearing command history..."
history -c 2>/dev/null || true
rm -f ~/.bash_history 2>/dev/null || true
rm -f ~/.zsh_history 2>/dev/null || true

# Clean up authorization file if it exists
rm -f /tmp/vm-clean-authorized 2>/dev/null || true

echo ""
echo "✅ VM cleaned successfully!"
echo "This VM now represents a fresh macOS installation without any package managers."
echo ""
echo "To verify cleanliness:"
echo "  - Homebrew should not exist: command -v brew (should return nothing)"
echo "  - No packages in /opt/homebrew or /usr/local"
echo ""