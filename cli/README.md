# Brower VM Test Manager CLI

A command-line interface for managing macOS virtual machines to test Homebrew installations and the Brower app.

## Prerequisites

1. **Install Tart** (macOS VM manager):
```bash
brew install cirruslabs/cli/tart
```

2. **Install dependencies**:
```bash
npm install
```

## Usage

### Interactive Menu Mode

Launch the interactive CLI menu:
```bash
npm run vm
```

This presents a numbered menu with all available operations:
- Quick Start (auto-restore & test)
- Create/manage VMs
- Snapshot management
- Run various test suites
- VM operations (start/stop/SSH)
- Status checks

### Direct Command Mode

Run specific commands directly:

```bash
# Quick commands via npm scripts
npm run vm:status    # Check VM and snapshot status
npm run vm:run       # Quick start (restore & test)
npm run vm:test      # Run all tests

# Direct command execution
node cli/vm-cli.cjs create          # Create new VM
node cli/vm-cli.cjs create-clean    # Create clean VM without Homebrew
node cli/vm-cli.cjs snapshot        # Create snapshot
node cli/vm-cli.cjs restore         # Restore from snapshot
node cli/vm-cli.cjs test            # Run all tests
node cli/vm-cli.cjs test formulae   # Test CLI tools only
node cli/vm-cli.cjs test casks      # Test GUI apps only
node cli/vm-cli.cjs interactive     # Start interactive session
node cli/vm-cli.cjs ssh             # Connect via SSH
node cli/vm-cli.cjs status          # Check status
```

### Alternative Ink-based CLI (requires TTY)

For a more advanced terminal UI with live output streaming:
```bash
npm run vm:ink
```

Note: This requires a proper TTY terminal and won't work in some environments.

## Test Scripts

The CLI manages three test scripts:

1. **Full Test Suite** (`test-homebrew-install.sh`)
   - Tests Homebrew installation
   - Tests all formulae (CLI tools)
   - Tests all casks (GUI apps)
   - Tests fonts

2. **Formulae Only** (`test-homebrew-install-formulae.sh`)
   - Tests CLI tools only
   - Faster execution
   - Good for quick validation

3. **Casks Only** (`test-homebrew-install-casks.sh`)
   - Tests GUI applications only
   - Tests subset of popular apps
   - Includes font testing

## VM Management

### VM Lifecycle

1. **Create VM**: Sets up a new macOS VM
2. **Create Clean VM**: Creates VM without Homebrew pre-installed
3. **Snapshot**: Save current VM state for quick restoration
4. **Restore**: Reset VM to snapshot state
5. **Delete**: Remove VM or all VMs and snapshots

### Typical Workflow

```bash
# Initial setup
npm run vm
# Choose: 3 (Create Clean VM)

# Run tests
npm run vm:run

# Check results
npm run vm
# Choose: 12 (Connect via SSH)
# In VM: ls ~/brower-test-*.log

# Reset for next test
npm run vm
# Choose: 5 (Restore from Snapshot)
```

## Configuration

The VM settings are configured in `scripts/setup-test-vm.sh`:
- VM Name: `brower-test`
- Base Image: macOS Sonoma
- Resources: 2 CPU cores, 4GB RAM
- Default password: `admin`

## Troubleshooting

### Tart not found
Install Tart first:
```bash
brew install cirruslabs/cli/tart
```

### SSH connection issues
Install sshpass for automated password entry:
```bash
brew install hudochenkov/sshpass/sshpass
```

### Raw mode not supported (Ink CLI)
Use the standard CLI instead:
```bash
npm run vm  # Uses vm-cli.cjs instead of Ink version
```

## Files

- `cli/vm-cli.cjs` - Main CLI implementation (CommonJS)
- `cli/vm-manager.tsx` - Ink-based CLI (requires TTY)
- `scripts/setup-test-vm.sh` - VM management script
- `scripts/test-homebrew-install.sh` - Full test suite
- `scripts/test-homebrew-install-formulae.sh` - Formulae tests
- `scripts/test-homebrew-install-casks.sh` - Cask tests
- `scripts/clean-vm.sh` - VM cleanup script