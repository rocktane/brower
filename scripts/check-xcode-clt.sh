#!/bin/bash

# Check if Xcode Command Line Tools are installed
check_xcode_clt() {
    if xcode-select -p &>/dev/null; then
        echo "✅ Xcode Command Line Tools are installed"
        return 0
    else
        echo "⚠️  Xcode Command Line Tools are NOT installed"
        echo ""
        echo "Some applications may prompt you to install them."
        echo "This is normal for development tools."
        echo ""
        echo "To install now (optional):"
        echo "  xcode-select --install"
        return 1
    fi
}

# Apps that typically need Xcode CLT
NEEDS_XCODE=(
    "visual-studio-code"
    "cursor"
    "android-studio"
    "docker"
    "macports"
    "stats"  # Sometimes
    "raycast"  # For extensions
)

# Check if any requested apps need Xcode
check_if_needed() {
    local apps="$@"
    local needs_xcode=false
    
    for app in "${NEEDS_XCODE[@]}"; do
        if [[ " $apps " =~ " $app " ]]; then
            needs_xcode=true
            echo "⚠️  $app may require Xcode Command Line Tools"
        fi
    done
    
    if [ "$needs_xcode" = true ]; then
        echo ""
        check_xcode_clt
    fi
}

# Main
if [ $# -eq 0 ]; then
    check_xcode_clt
else
    check_if_needed "$@"
fi