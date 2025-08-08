#!/bin/bash

# Setup SSH key authentication for Tart VM

VM_NAME="brower-test"

echo "🔑 Setting up SSH key authentication for VM..."

# Generate SSH key if it doesn't exist
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "Generating SSH key..."
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
fi

# Get VM IP
VM_IP=$(tart ip "$VM_NAME")

if [ -z "$VM_IP" ]; then
    echo "❌ VM is not running. Start it with: ./scripts/setup-test-vm.sh start"
    exit 1
fi

echo "📋 Copying SSH key to VM (password will be 'admin')..."
ssh-copy-id -o StrictHostKeyChecking=no admin@"$VM_IP"

echo "✅ SSH key setup complete! You can now connect without a password."
echo "Test it with: ./scripts/setup-test-vm.sh ssh"