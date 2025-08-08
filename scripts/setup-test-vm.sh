#!/bin/bash

# Setup script for Tart VM to test Homebrew installations
# This creates a clean macOS VM for testing the Brower app commands

set -e

VM_NAME="brower-test"
VM_IMAGE="ghcr.io/cirruslabs/macos-sonoma-base:latest"
SNAPSHOT_NAME="clean-base"
VM_PASSWORD="admin"

echo "🚀 Setting up Tart VM for Brower testing..."

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo "📦 Installing sshpass for automated password entry..."
    brew install hudochenkov/sshpass/sshpass 2>/dev/null || brew install sshpass 2>/dev/null || true
fi

# Function to cleanup existing VM
cleanup_vm() {
    if tart list | grep -q "$VM_NAME"; then
        echo "⚠️  Removing existing VM: $VM_NAME"
        tart stop "$VM_NAME" 2>/dev/null || true
        tart delete "$VM_NAME"
    fi
}

# Function to create and configure VM
create_vm() {
    # Check if snapshot exists first
    if tart list | grep -q "${VM_NAME}-snapshot"; then
        echo "📸 Found existing snapshot, creating VM from clean snapshot..."
        tart clone "${VM_NAME}-snapshot" "$VM_NAME"
        echo "✅ VM created from clean snapshot: $VM_NAME"
    else
        echo "📦 No snapshot found. Creating new VM from base image..."
        tart clone "$VM_IMAGE" "$VM_NAME"
        
        echo "⚙️  Configuring VM..."
        # Minimal resources for CLI testing
        tart set "$VM_NAME" --cpu 2 --memory 4096
        
        # Start VM to remove Homebrew
        echo "🔄 Starting VM to remove Homebrew..."
        tart run "$VM_NAME" > /dev/null 2>&1 &
        echo "⏳ Waiting for VM to boot..."
        sleep 30
        
        # Get VM IP
        VM_IP=$(tart ip "$VM_NAME" 2>/dev/null)
        if [ -n "$VM_IP" ]; then
            echo "🧹 Removing Homebrew from VM..."
            # Check if sshpass is available
            if command -v sshpass &> /dev/null; then
                # Remove Homebrew if it exists
                sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null admin@"$VM_IP" << 'EOF'
if command -v brew &> /dev/null || [ -d "/opt/homebrew" ]; then
    echo "Removing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/uninstall.sh)" --force </dev/null 2>&1
    sudo rm -rf /opt/homebrew /usr/local/Homebrew /usr/local/Caskroom /usr/local/bin/brew /Library/Caches/Homebrew ~/Library/Caches/Homebrew 2>/dev/null
    echo "Homebrew removed"
else
    echo "No Homebrew found"
fi
EOF
            else
                ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null admin@"$VM_IP" << 'EOF'
if command -v brew &> /dev/null || [ -d "/opt/homebrew" ]; then
    echo "Removing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/uninstall.sh)" --force </dev/null 2>&1
    sudo rm -rf /opt/homebrew /usr/local/Homebrew /usr/local/Caskroom /usr/local/bin/brew /Library/Caches/Homebrew ~/Library/Caches/Homebrew 2>/dev/null
    echo "Homebrew removed"
else
    echo "No Homebrew found"
fi
EOF
            fi
            
            # Stop VM after cleaning
            echo "Stopping VM..."
            tart stop "$VM_NAME"
            
            # Create snapshot of clean VM
            echo "📸 Creating snapshot of clean VM..."
            tart clone "$VM_NAME" "${VM_NAME}-snapshot"
            echo "✅ Clean VM and snapshot created"
        else
            echo "⚠️  Could not get VM IP. VM created but may have Homebrew installed."
        fi
        
        echo "✅ VM created: $VM_NAME"
    fi
}

# Function to create a truly clean VM
create_clean_vm() {
    echo "🧹 Creating truly clean VM without Homebrew..."
    
    # Create VM first
    create_vm
    
    # Start VM
    echo "🔄 Starting VM to clean it..."
    tart run "$VM_NAME" &
    echo "⏳ Waiting for VM to boot..."
    sleep 30
    
    # Get VM IP
    VM_IP=$(tart ip "$VM_NAME" 2>/dev/null)
    if [ -z "$VM_IP" ]; then
        echo "❌ Could not get VM IP. VM may not be ready."
        return 1
    fi
    
    echo "🧹 Removing Homebrew and all packages from VM..."
    
    # Copy and run clean script (with VM_ENVIRONMENT flag to bypass safety check)
    if command -v sshpass &> /dev/null; then
        sshpass -p "$VM_PASSWORD" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ./scripts/clean-vm.sh admin@"$VM_IP":~/
        sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null admin@"$VM_IP" "chmod +x ~/clean-vm.sh && VM_ENVIRONMENT=true ~/clean-vm.sh"
        
        # Verify Homebrew is gone
        echo "🔍 Verifying clean state..."
        if sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null admin@"$VM_IP" "command -v brew" 2>/dev/null; then
            echo "⚠️  Warning: Homebrew still exists after cleanup"
        else
            echo "✅ Confirmed: Homebrew successfully removed"
        fi
    else
        scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ./scripts/clean-vm.sh admin@"$VM_IP":~/
        ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null admin@"$VM_IP" "chmod +x ~/clean-vm.sh && VM_ENVIRONMENT=true ~/clean-vm.sh"
    fi
    
    # Stop VM for snapshot
    echo "Stopping VM to create clean snapshot..."
    tart stop "$VM_NAME"
    
    echo "✅ Clean VM created without any package managers"
}

# Function to create a snapshot
create_snapshot() {
    echo "📸 Creating snapshot: $SNAPSHOT_NAME"
    # Stop VM if running
    if tart list | grep "$VM_NAME" | grep -q "running"; then
        echo "Stopping VM for snapshot..."
        tart stop "$VM_NAME"
    fi
    
    # Create snapshot (this is basically a full clone in Tart)
    # We'll use a workaround: clone the VM as a backup
    if tart list | grep -q "${VM_NAME}-snapshot"; then
        tart delete "${VM_NAME}-snapshot" 2>/dev/null || true
    fi
    tart clone "$VM_NAME" "${VM_NAME}-snapshot"
    echo "✅ Snapshot created: ${VM_NAME}-snapshot"
}

# Function to restore from snapshot
restore_snapshot() {
    echo "📸 Restoring from snapshot..."
    
    # Check if snapshot exists
    if ! tart list | grep -q "${VM_NAME}-snapshot"; then
        echo "❌ No snapshot found. Create one first with: $0 snapshot"
        return 1
    fi
    
    # Remove current VM if exists
    if tart list | grep -q "$VM_NAME" | grep -v snapshot; then
        echo "Removing current VM..."
        tart stop "$VM_NAME" 2>/dev/null || true
        tart delete "$VM_NAME"
    fi
    
    # Clone from snapshot
    echo "Restoring from snapshot..."
    tart clone "${VM_NAME}-snapshot" "$VM_NAME"
    echo "✅ VM restored from snapshot"
}

# Function to start VM
start_vm() {
    echo "🔄 Starting VM..."
    tart run "$VM_NAME" &
    
    # Wait for VM to be ready
    echo "⏳ Waiting for VM to boot (this may take a minute)..."
    sleep 30
    
    # Get VM IP
    VM_IP=$(tart ip "$VM_NAME" 2>/dev/null || echo "IP not yet assigned")
    echo "📍 VM IP: $VM_IP"
}

# Main execution
main() {
    case "${1:-create}" in
        create)
            cleanup_vm
            create_vm
            echo ""
            echo "✅ VM setup complete!"
            if tart list | grep -q "${VM_NAME}-snapshot"; then
                echo "ℹ️  VM created from clean snapshot (no Homebrew)"
            else
                echo "ℹ️  VM created without Homebrew and snapshot saved"
            fi
            echo "To start the VM: ./setup-test-vm.sh start"
            echo "To run tests: ./setup-test-vm.sh test"
            ;;
        
        create-clean)
            cleanup_vm
            create_clean_vm
            echo ""
            echo "✅ Clean VM created without Homebrew!"
            echo "📸 Creating snapshot of clean state..."
            create_snapshot
            echo ""
            echo "✅ Clean VM and snapshot ready!"
            echo "To run tests: ./setup-test-vm.sh run"
            ;;
        
        snapshot)
            create_snapshot
            echo ""
            echo "✅ Snapshot created!"
            echo "Use 'restore' to quickly reset to this clean state"
            ;;
        
        restore)
            restore_snapshot
            echo ""
            echo "✅ VM restored to clean state!"
            echo "Start it with: ./setup-test-vm.sh start"
            ;;
        
        start)
            start_vm
            echo ""
            echo "✅ VM is running!"
            echo "Connect with: ./setup-test-vm.sh ssh"
            ;;
        
        ssh)
            VM_IP=$(tart ip "$VM_NAME")
            echo "🔗 Connecting to VM..."
            if command -v sshpass &> /dev/null; then
                sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null admin@"$VM_IP"
            else
                ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null admin@"$VM_IP"
            fi
            ;;
        
        stop)
            echo "🛑 Stopping VM..."
            tart stop "$VM_NAME"
            echo "✅ VM stopped"
            ;;
        
        delete)
            cleanup_vm
            echo "✅ VM deleted"
            ;;
        
        delete-all)
            cleanup_vm
            if tart list | grep -q "${VM_NAME}-snapshot"; then
                echo "Deleting snapshot..."
                tart delete "${VM_NAME}-snapshot"
            fi
            echo "✅ All VMs and snapshots deleted"
            ;;
        
        test)
            # Support different test types
            TEST_TYPE="${2:-all}"
            case "$TEST_TYPE" in
                formulae)
                    echo "🧪 Running formulae-only test script in VM..."
                    TEST_SCRIPT="test-homebrew-install-formulae.sh"
                    ;;
                casks)
                    echo "🧪 Running casks-only test script in VM..."
                    TEST_SCRIPT="test-homebrew-install-casks.sh"
                    ;;
                *)
                    echo "🧪 Running full test script in VM..."
                    TEST_SCRIPT="test-homebrew-install.sh"
                    ;;
            esac
            
            VM_IP=$(tart ip "$VM_NAME")
            # Copy and run test script with automated password
            if command -v sshpass &> /dev/null; then
                sshpass -p "$VM_PASSWORD" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ./scripts/$TEST_SCRIPT admin@"$VM_IP":~/
                sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null admin@"$VM_IP" "chmod +x ~/$TEST_SCRIPT && ~/$TEST_SCRIPT"
            else
                scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ./scripts/$TEST_SCRIPT admin@"$VM_IP":~/
                ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null admin@"$VM_IP" "chmod +x ~/$TEST_SCRIPT && ~/$TEST_SCRIPT"
            fi
            ;;
        
        run)
            echo "🚀 Starting VM and running tests..."
            
            # Check if VM exists
            if ! tart list | grep -q "$VM_NAME" | grep -v snapshot; then
                echo "📦 VM does not exist. Creating it first..."
                cleanup_vm
                create_vm
                
                # Create snapshot for future runs
                echo "📸 Creating snapshot for future clean runs..."
                create_snapshot
            else
                # VM exists, check if we have a snapshot to restore from
                if tart list | grep -q "${VM_NAME}-snapshot"; then
                    echo "🔄 VM exists, restoring from snapshot for clean state..."
                    restore_snapshot
                else
                    echo "⚠️  VM exists but no snapshot found. Creating snapshot for next time..."
                    create_snapshot
                fi
            fi
        
            # Start VM
            echo "🔄 Starting VM..."
            tart run "$VM_NAME" &
            echo "⏳ Waiting for VM to boot..."
            sleep 30
            
            # Get VM IP
            VM_IP=$(tart ip "$VM_NAME" 2>/dev/null)
            if [ -z "$VM_IP" ]; then
                echo "❌ Could not get VM IP. VM may not be ready."
                exit 1
            fi
            
            echo "📍 VM IP: $VM_IP"
            echo "🧪 Running test script..."
            
            # Copy and run test script with automated password
            if command -v sshpass &> /dev/null; then
                sshpass -p "$VM_PASSWORD" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ./scripts/test-homebrew-install.sh admin@"$VM_IP":~/
                sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null admin@"$VM_IP" "chmod +x ~/test-homebrew-install.sh && ~/test-homebrew-install.sh"
            else
                scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ./scripts/test-homebrew-install.sh admin@"$VM_IP":~/
                ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null admin@"$VM_IP" "chmod +x ~/test-homebrew-install.sh && ~/test-homebrew-install.sh"
            fi
            
            echo ""
            echo "✅ Tests complete!"
            echo "To review results, run: ./setup-test-vm.sh ssh"
            echo "Then check: ls ~/brower-test-*.log"
            ;;
        
        clean-run)
            echo "🧹 Starting fresh VM and running tests..."
            # Always start with a clean VM
            cleanup_vm
            create_vm
            
            # Start VM
            echo "🔄 Starting VM..."
            tart run "$VM_NAME" &
            echo "⏳ Waiting for VM to boot..."
            sleep 30
            
            # Get VM IP
            VM_IP=$(tart ip "$VM_NAME" 2>/dev/null)
            if [ -z "$VM_IP" ]; then
                echo "❌ Could not get VM IP. VM may not be ready."
                exit 1
            fi
            
            echo "📍 VM IP: $VM_IP"
            echo "🧪 Running test script..."
            
            # Copy and run test script with automated password
            if command -v sshpass &> /dev/null; then
                sshpass -p "$VM_PASSWORD" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ./scripts/test-homebrew-install.sh admin@"$VM_IP":~/
                sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null admin@"$VM_IP" "chmod +x ~/test-homebrew-install.sh && ~/test-homebrew-install.sh"
            else
                scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ./scripts/test-homebrew-install.sh admin@"$VM_IP":~/
                ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null admin@"$VM_IP" "chmod +x ~/test-homebrew-install.sh && ~/test-homebrew-install.sh"
            fi
            
            echo ""
            echo "✅ Tests complete!"
            echo "To review results, run: ./setup-test-vm.sh ssh"
            echo "Then check: ls ~/brower-test-*.log"
            ;;
        
        fast-clean-run)
            echo "⚡ Fast clean test using snapshot..."
            
            # Check if snapshot exists
            if ! tart list | grep -q "${VM_NAME}-snapshot"; then
                echo "❌ No snapshot found. Creating initial VM and snapshot..."
                cleanup_vm
                create_vm
                create_snapshot
            else
                # Restore from snapshot (much faster than creating new)
                restore_snapshot
            fi
            
            # Start VM
            echo "🔄 Starting VM..."
            tart run "$VM_NAME" &
            echo "⏳ Waiting for VM to boot..."
            sleep 30
            
            # Get VM IP
            VM_IP=$(tart ip "$VM_NAME" 2>/dev/null)
            if [ -z "$VM_IP" ]; then
                echo "❌ Could not get VM IP. VM may not be ready."
                exit 1
            fi
            
            echo "📍 VM IP: $VM_IP"
            echo "🧪 Running test script..."
            
            # Copy and run test script with automated password
            if command -v sshpass &> /dev/null; then
                sshpass -p "$VM_PASSWORD" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ./scripts/test-homebrew-install.sh admin@"$VM_IP":~/
                sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null admin@"$VM_IP" "chmod +x ~/test-homebrew-install.sh && ~/test-homebrew-install.sh"
            else
                scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ./scripts/test-homebrew-install.sh admin@"$VM_IP":~/
                ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null admin@"$VM_IP" "chmod +x ~/test-homebrew-install.sh && ~/test-homebrew-install.sh"
            fi
            
            echo ""
            echo "✅ Tests complete!"
            echo "To review results, run: ./setup-test-vm.sh ssh"
            echo "Then check: ls ~/brower-test-*.log"
            ;;
        
        interactive)
            echo "🖥️  Setting up clean VM for interactive testing..."
            
            # Check if VM exists
            if ! tart list | grep -q "$VM_NAME" | grep -v snapshot; then
                echo "📦 VM does not exist. Creating it first..."
                cleanup_vm
                create_vm
                
                # Create snapshot for future runs
                echo "📸 Creating snapshot for future clean runs..."
                create_snapshot
            else
                # VM exists, check if we have a snapshot to restore from
                if tart list | grep -q "${VM_NAME}-snapshot"; then
                    echo "🔄 VM exists, restoring from snapshot for clean state..."
                    restore_snapshot
                else
                    echo "⚠️  VM exists but no snapshot found. Creating snapshot for next time..."
                    create_snapshot
                fi
            fi
        
            # Start VM if not running
            if ! tart list | grep "$VM_NAME" | grep -v snapshot | grep -q "running"; then
                echo "🔄 Starting VM..."
                tart run "$VM_NAME" &
                echo "⏳ Waiting for VM to boot..."
                sleep 30
            fi
            
            # Get VM IP
            VM_IP=$(tart ip "$VM_NAME" 2>/dev/null)
            if [ -z "$VM_IP" ]; then
                echo "❌ Could not get VM IP. VM may not be ready."
                exit 1
            fi
            
            echo ""
            echo "✅ Clean VM is ready for interactive testing!"
            echo "======================================"
            echo "📍 VM IP: $VM_IP"
            echo "👤 Username: admin"
            echo "🔑 Password: $VM_PASSWORD"
            echo ""
            echo "🚀 Quick commands to run from your terminal:"
            echo ""
            echo "# Connect via SSH:"
            echo "ssh admin@$VM_IP"
            echo ""
            echo "# Run a command directly (with password):"
            if command -v sshpass &> /dev/null; then
                echo "sshpass -p '$VM_PASSWORD' ssh -o StrictHostKeyChecking=no admin@$VM_IP 'COMMAND'"
                echo ""
                echo "# Examples:"
                echo "sshpass -p '$VM_PASSWORD' ssh -o StrictHostKeyChecking=no admin@$VM_IP 'brew --version'"
                echo "sshpass -p '$VM_PASSWORD' ssh -o StrictHostKeyChecking=no admin@$VM_IP 'brew list'"
                echo "sshpass -p '$VM_PASSWORD' ssh -o StrictHostKeyChecking=no admin@$VM_IP 'brew install --cask stats'"
            else
                echo "ssh admin@$VM_IP 'COMMAND'"
                echo ""
                echo "# Examples:"
                echo "ssh admin@$VM_IP 'brew --version'"
                echo "ssh admin@$VM_IP 'brew list'"
                echo "ssh admin@$VM_IP 'brew install --cask stats'"
            fi
            echo ""
            echo "# Copy files to VM:"
            echo "scp FILE admin@$VM_IP:~/"
            echo ""
            echo "# Run multiple commands:"
            if command -v sshpass &> /dev/null; then
                echo "sshpass -p '$VM_PASSWORD' ssh -o StrictHostKeyChecking=no admin@$VM_IP << 'EOF'"
                echo "brew --version"
                echo "brew list"
                echo "brew install --cask stats"
                echo "EOF"
            else
                echo "ssh admin@$VM_IP << 'EOF'"
                echo "brew --version"
                echo "brew list"
                echo "brew install --cask stats"
                echo "EOF"
            fi
            echo ""
            echo "======================================"
            ;;
        
        exec)
            # Execute a command in the VM directly
            if [ -z "$2" ]; then
                echo "❌ Usage: $0 exec 'COMMAND'"
                echo "Example: $0 exec 'brew --version'"
                exit 1
            fi
            
            # Get VM IP
            VM_IP=$(tart ip "$VM_NAME" 2>/dev/null)
            if [ -z "$VM_IP" ]; then
                echo "❌ VM is not running. Start it first with: $0 interactive"
                exit 1
            fi
            
            # Execute the command
            shift # Remove 'exec' from arguments
            COMMAND="$*"
            
            if command -v sshpass &> /dev/null; then
                sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null admin@"$VM_IP" "$COMMAND"
            else
                ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null admin@"$VM_IP" "$COMMAND"
            fi
            ;;
        
        status)
            echo "📊 Checking VM status..."
            echo ""
            
            # Check main VM
            if tart list | grep -q "$VM_NAME"; then
                echo "✅ VM exists: $VM_NAME"
                VM_STATUS=$(tart list | grep "$VM_NAME" | grep -v snapshot | awk '{print $NF}')
                echo "   Status: $VM_STATUS"
                
                if [ "$VM_STATUS" = "running" ]; then
                    VM_IP=$(tart ip "$VM_NAME" 2>/dev/null || echo "Getting IP...")
                    echo "   IP: $VM_IP"
                fi
            else
                echo "❌ VM does not exist: $VM_NAME"
            fi
            
            echo ""
            
            # Check snapshot
            if tart list | grep -q "${VM_NAME}-snapshot"; then
                echo "📸 Snapshot exists: ${VM_NAME}-snapshot"
                SNAPSHOT_STATUS=$(tart list | grep "${VM_NAME}-snapshot" | awk '{print $NF}')
                echo "   Status: $SNAPSHOT_STATUS"
            else
                echo "📸 No snapshot found"
            fi
            
            echo ""
            echo "📋 All Tart VMs:"
            tart list | grep -E "(${VM_NAME}|Name)" || echo "No VMs found"
            ;;
        
        *)
            echo "Usage: $0 {create|create-clean|snapshot|restore|start|ssh|stop|delete|delete-all|test|run|clean-run|fast-clean-run|interactive|exec|status}"
            echo ""
            echo "Commands:"
            echo "  create          - Create a new test VM (may have Homebrew)"
            echo "  create-clean    - Create truly clean VM without Homebrew + snapshot"
            echo "  snapshot        - Create a snapshot of current VM state"
            echo "  restore         - Restore VM from snapshot"
            echo "  start           - Start the VM"
            echo "  ssh             - Connect to VM via SSH"
            echo "  stop            - Stop the VM"
            echo "  delete          - Delete the VM"
            echo "  delete-all      - Delete VM and all snapshots"
            echo "  test [type]     - Run test script in VM (type: all/formulae/casks)"
            echo "  run             - Run tests (auto-restores from snapshot if VM exists)"
            echo "  clean-run       - Delete, recreate, and test with fresh VM (slow)"
            echo "  fast-clean-run  - Restore from snapshot and test (same as run now)"
            echo "  interactive     - Start clean VM for manual testing (shows commands)"
            echo "  exec 'CMD'      - Execute a command in the VM directly"
            echo "  status          - Check VM and snapshot status"
            exit 1
            ;;
    esac
}

main "$@"