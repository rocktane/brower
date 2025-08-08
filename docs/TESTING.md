# Testing Brower with Tart VMs

This document describes how to test Brower's Homebrew installation commands in a clean macOS environment using Tart virtualization.

## Prerequisites

1. **Install Tart** (if not already installed):
   ```bash
   brew install cirruslabs/cli/tart
   ```

2. **System Requirements**:
   - Apple Silicon Mac (M1/M2/M3)
   - macOS Ventura or later
   - At least 8GB RAM (4GB will be allocated to VM)
   - 20GB free disk space

## Quick Start

```bash
# Make scripts executable
chmod +x scripts/setup-test-vm.sh
chmod +x scripts/test-homebrew-install.sh

# Create and configure the VM
./scripts/setup-test-vm.sh create

# Start the VM
./scripts/setup-test-vm.sh start

# Run automated tests
./scripts/setup-test-vm.sh test
```

## Detailed Workflow

### 1. VM Management

The `setup-test-vm.sh` script provides these commands:

- `create` - Creates a new clean macOS VM
- `start` - Starts the VM
- `ssh` - Connect to VM via SSH
- `stop` - Stops the VM
- `delete` - Removes the VM completely
- `test` - Runs the automated test script
- `status` - Shows VM status

### 2. Manual Testing

To manually test Brower commands:

1. **Connect to the VM**:
   ```bash
   ./scripts/setup-test-vm.sh ssh
   ```

2. **Inside the VM, test a Brower command**:
   ```bash
   # Example command from Brower
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" && \
   brew install --cask raycast stats rectangle
   ```

3. **Check for common issues**:
   - PATH configuration problems
   - Missing dependencies
   - Permission errors
   - Network connectivity

### 3. Automated Testing

The `test-homebrew-install.sh` script automatically:

1. Checks/installs Homebrew
2. Configures PATH for Apple Silicon
3. Tests sample cask installations
4. Tests CLI tool installations
5. Tests tap installations
6. Verifies all installations
7. Generates a detailed log file

### 4. Testing Scenarios

#### Clean Install Test
```bash
# Start with fresh VM
./scripts/setup-test-vm.sh delete
./scripts/setup-test-vm.sh create
./scripts/setup-test-vm.sh start
./scripts/setup-test-vm.sh test
```

#### PATH Configuration Test
```bash
./scripts/setup-test-vm.sh ssh
# Inside VM:
echo $PATH
which brew
# Should show /opt/homebrew/bin/brew on Apple Silicon
```

#### Error Recovery Test
```bash
# Test with network interruption
./scripts/setup-test-vm.sh ssh
# Inside VM, interrupt installation:
brew install --cask some-large-app
# Press Ctrl+C during download
# Verify cleanup and retry works
```

## Common Issues and Solutions

### Issue: Homebrew PATH not configured
**Symptom**: `brew: command not found` after installation  
**Solution**: The test script now automatically adds:
```bash
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### Issue: VM won't start
**Symptom**: Tart run hangs or fails  
**Solution**: 
```bash
# Check Tart status
tart list
# Clean up and retry
./scripts/setup-test-vm.sh delete
./scripts/setup-test-vm.sh create
```

### Issue: SSH connection refused
**Symptom**: Cannot connect to VM  
**Solution**: Wait for VM to fully boot (30-60 seconds) or check IP:
```bash
tart ip brower-test
```

## Analyzing Test Results

After running tests, check the log file in the VM:

```bash
./scripts/setup-test-vm.sh ssh
# Inside VM:
ls ~/brower-test-*.log
cat ~/brower-test-*.log | grep "❌"  # Show errors
cat ~/brower-test-*.log | grep "✅"  # Show successes
```

## Continuous Testing

For CI/CD integration, you could extend the scripts to:

1. Run tests on each PR
2. Test against multiple macOS versions
3. Generate test reports
4. Cache VM images for faster testing

## Cleanup

After testing:

```bash
# Stop and remove the VM
./scripts/setup-test-vm.sh stop
./scripts/setup-test-vm.sh delete
```

## Notes

- The VM uses minimal resources (2 CPU, 4GB RAM)
- Default credentials: username `admin`, password `admin`
- VM image is based on macOS Sonoma
- Tests simulate real user scenarios
- Logs are timestamped and preserved