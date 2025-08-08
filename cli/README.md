# Brower VM Test Manager CLI

An interactive command-line interface for managing macOS virtual machines to test Homebrew installations.

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

Launch the interactive CLI with keyboard navigation:
```bash
npm run vm
```

This presents an interactive menu with:
- **Arrow keys** to navigate
- **Enter** to select
- **Escape** to go back

### Menu Options

- **🚀 Quick Start** - Auto-restore from snapshot and run tests
- **📦 Create New VM** - Create a new test VM
- **🧹 Create Clean VM** - Create VM without Homebrew
- **📸 Snapshot Management** - Create or restore snapshots
- **🔗 Connect via SSH** - Open SSH session to VM
- **⚙️ VM Operations** - Start, stop, or delete VMs
- **📊 Check Status** - View VM and snapshot status

### Direct Command Mode

Run specific commands directly:

```bash
# Quick commands via npm scripts
npm run vm:status    # Check VM and snapshot status
npm run vm:run       # Quick start (restore & test)
npm run vm:test      # Run all tests

# Direct execution
node cli/vm-interactive.js status    # Check status
node cli/vm-interactive.js run       # Run tests
```

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

- `cli/vm-interactive.js` - Interactive CLI with keyboard navigation
- `scripts/setup-test-vm.sh` - VM management script
- `scripts/test-homebrew-install.sh` - Full test suite
- `scripts/test-homebrew-install-formulae.sh` - Formulae tests
- `scripts/test-homebrew-install-casks.sh` - Cask tests
- `scripts/clean-vm.sh` - VM cleanup script
- `scripts/brower-install.sh` - Brower-style installation script
- `scripts/install-brew-interactive.sh` - Interactive Homebrew installer