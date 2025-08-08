#!/usr/bin/env tsx
import React, { useState, useEffect } from 'react';
import { render, Text, Box, useInput, useApp, isRawModeSupported } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import TextInput from 'ink-text-input';
import { spawn } from 'child_process';
import chalk from 'chalk';
import meow from 'meow';

// Check if we can use interactive mode
if (!isRawModeSupported) {
  console.error('Error: Interactive mode is not supported in this environment.');
  console.error('Please run this command in a proper terminal.');
  process.exit(1);
}

interface MenuItem {
  label: string;
  value: string;
  description?: string;
}

interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
}

const mainMenuItems: MenuItem[] = [
  { label: '🚀 Quick Start - Run Tests', value: 'run', description: 'Auto-restore from snapshot and run tests' },
  { label: '📦 Create New VM', value: 'create', description: 'Create a new test VM' },
  { label: '🧹 Create Clean VM (without Homebrew)', value: 'create-clean', description: 'Create truly clean VM and snapshot' },
  { label: '📸 Manage Snapshots', value: 'snapshot-menu', description: 'Create or restore snapshots' },
  { label: '🧪 Run Tests', value: 'test-menu', description: 'Various test options' },
  { label: '🖥️  Interactive Session', value: 'interactive', description: 'Start VM for manual testing' },
  { label: '⚙️  VM Operations', value: 'vm-ops', description: 'Start, stop, delete VMs' },
  { label: '📊 Check Status', value: 'status', description: 'View VM and snapshot status' },
  { label: '❌ Exit', value: 'exit', description: 'Exit the CLI' }
];

const snapshotMenuItems: MenuItem[] = [
  { label: '📸 Create Snapshot', value: 'snapshot', description: 'Save current VM state' },
  { label: '⏮️  Restore from Snapshot', value: 'restore', description: 'Restore VM from saved state' },
  { label: '🔙 Back to Main Menu', value: 'back' }
];

const testMenuItems: MenuItem[] = [
  { label: '🧪 Run All Tests', value: 'test', description: 'Run complete test suite' },
  { label: '⚡ Run Tests (Fast - from snapshot)', value: 'fast-clean-run', description: 'Restore snapshot and test' },
  { label: '🧹 Run Tests (Clean - new VM)', value: 'clean-run', description: 'Delete, recreate, and test' },
  { label: '🔧 Test Formulae Only', value: 'test-formulae', description: 'Test CLI tools only' },
  { label: '🖼️  Test Casks Only', value: 'test-casks', description: 'Test GUI apps only' },
  { label: '🔙 Back to Main Menu', value: 'back' }
];

const vmOpsMenuItems: MenuItem[] = [
  { label: '▶️  Start VM', value: 'start', description: 'Boot the VM' },
  { label: '⏹️  Stop VM', value: 'stop', description: 'Shutdown the VM' },
  { label: '🔗 Connect via SSH', value: 'ssh', description: 'SSH into the VM' },
  { label: '🗑️  Delete VM', value: 'delete', description: 'Remove the VM' },
  { label: '💣 Delete All (VM + Snapshots)', value: 'delete-all', description: 'Remove everything' },
  { label: '🔙 Back to Main Menu', value: 'back' }
];

const executeCommand = (command: string, args: string[] = []): Promise<CommandResult> => {
  return new Promise((resolve) => {
    const scriptPath = './scripts/setup-test-vm.sh';
    const fullArgs = args.length > 0 ? [command, ...args] : [command];
    
    const child = spawn(scriptPath, fullArgs, {
      shell: true,
      env: { ...process.env }
    });

    let output = '';
    let error = '';

    child.stdout?.on('data', (data) => {
      output += data.toString();
    });

    child.stderr?.on('data', (data) => {
      error += data.toString();
    });

    child.on('close', (code) => {
      resolve({
        success: code === 0,
        output,
        error: error || undefined
      });
    });
  });
};

const CommandExecutor: React.FC<{ command: string; args?: string[]; onComplete: () => void }> = ({ command, args = [], onComplete }) => {
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    const runCommand = async () => {
      const scriptPath = './scripts/setup-test-vm.sh';
      const fullArgs = args.length > 0 ? [command, ...args] : [command];
      
      const child = spawn(scriptPath, fullArgs, {
        shell: true,
        env: { ...process.env }
      });

      child.stdout?.on('data', (data) => {
        const lines = data.toString().split('\n').filter(Boolean);
        setOutput(prev => [...prev, ...lines]);
      });

      child.stderr?.on('data', (data) => {
        const lines = data.toString().split('\n').filter(Boolean);
        setOutput(prev => [...prev, ...lines.map(l => chalk.red(l))]);
      });

      child.on('close', (code) => {
        setIsRunning(false);
        setOutput(prev => [...prev, '', code === 0 ? chalk.green('✅ Command completed successfully') : chalk.red(`❌ Command failed with code ${code}`)]);
        setTimeout(onComplete, 2000);
      });
    };

    runCommand();
  }, [command, args, onComplete]);

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="yellow">
          {isRunning && <Spinner type="dots" />}
          {isRunning ? ' Running: ' : ' Completed: '}
          {command} {args.join(' ')}
        </Text>
      </Box>
      <Box flexDirection="column" marginLeft={2}>
        {output.slice(-20).map((line, i) => (
          <Text key={`output-${i}-${Date.now()}`}>{line}</Text>
        ))}
      </Box>
    </Box>
  );
};

const App: React.FC<{ initialCommand?: string }> = ({ initialCommand }) => {
  const [currentMenu, setCurrentMenu] = useState<'main' | 'snapshot' | 'test' | 'vm-ops'>('main');
  const [executingCommand, setExecutingCommand] = useState<{ command: string; args?: string[] } | null>(null);
  const [showCustomCommand, setShowCustomCommand] = useState(false);
  const [customCommand, setCustomCommand] = useState('');
  const { exit } = useApp();

  useInput((input, key) => {
    if (key.escape || (key.ctrl && input === 'c')) {
      if (executingCommand) {
        setExecutingCommand(null);
      } else if (currentMenu !== 'main') {
        setCurrentMenu('main');
      } else {
        exit();
      }
    }
    
    if (key.ctrl && input === 'x') {
      setShowCustomCommand(true);
    }
  });

  useEffect(() => {
    if (initialCommand) {
      handleSelect({ value: initialCommand });
    }
  }, [initialCommand]);

  const handleSelect = (item: { value: string }) => {
    switch (item.value) {
      case 'exit':
        exit();
        break;
      
      case 'snapshot-menu':
        setCurrentMenu('snapshot');
        break;
      
      case 'test-menu':
        setCurrentMenu('test');
        break;
      
      case 'vm-ops':
        setCurrentMenu('vm-ops');
        break;
      
      case 'back':
        setCurrentMenu('main');
        break;
      
      case 'test-formulae':
        setExecutingCommand({ command: 'test', args: ['formulae'] });
        break;
      
      case 'test-casks':
        setExecutingCommand({ command: 'test', args: ['casks'] });
        break;
      
      default:
        setExecutingCommand({ command: item.value });
        break;
    }
  };

  const handleCommandComplete = () => {
    setExecutingCommand(null);
  };

  const handleCustomCommand = (value: string) => {
    if (value) {
      const parts = value.split(' ');
      setExecutingCommand({ command: parts[0], args: parts.slice(1) });
    }
    setShowCustomCommand(false);
    setCustomCommand('');
  };

  if (executingCommand) {
    return (
      <CommandExecutor
        command={executingCommand.command}
        args={executingCommand.args}
        onComplete={handleCommandComplete}
      />
    );
  }

  if (showCustomCommand) {
    return (
      <Box flexDirection="column">
        <Text bold color="cyan">Enter custom command:</Text>
        <Box marginTop={1}>
          <Text>$ ./setup-test-vm.sh </Text>
          <TextInput
            value={customCommand}
            onChange={setCustomCommand}
            onSubmit={handleCustomCommand}
          />
        </Box>
        <Box marginTop={1}>
          <Text dimColor>Press Enter to run, Escape to cancel</Text>
        </Box>
      </Box>
    );
  }

  let menuItems: MenuItem[] = [];
  let title = '';

  switch (currentMenu) {
    case 'snapshot':
      menuItems = snapshotMenuItems;
      title = '📸 Snapshot Management';
      break;
    case 'test':
      menuItems = testMenuItems;
      title = '🧪 Test Options';
      break;
    case 'vm-ops':
      menuItems = vmOpsMenuItems;
      title = '⚙️  VM Operations';
      break;
    default:
      menuItems = mainMenuItems;
      title = '🚀 Brower VM Test Manager';
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">{title}</Text>
      </Box>
      
      <SelectInput
        items={menuItems.map(item => ({
          label: item.label,
          value: item.value
        }))}
        onSelect={handleSelect}
      />
      
      <Box marginTop={1} flexDirection="column">
        {menuItems.find(item => item.value === menuItems[0].value)?.description && (
          <Text dimColor>
            {menuItems.find((item, index) => index === 0)?.description}
          </Text>
        )}
      </Box>
      
      <Box marginTop={2}>
        <Text dimColor>
          Use arrow keys to navigate, Enter to select, Ctrl+C to exit
          {currentMenu === 'main' && ', Ctrl+X for custom command'}
        </Text>
      </Box>
    </Box>
  );
};

const cli = meow(`
  Usage
    $ npx tsx cli/vm-manager.tsx [command]

  Commands
    run              Auto-restore from snapshot and run tests
    create           Create a new test VM
    create-clean     Create clean VM without Homebrew
    snapshot         Create a snapshot
    restore          Restore from snapshot
    test             Run tests
    status           Check VM status
    interactive      Start interactive session

  Options
    --help           Show help
    --version        Show version

  Examples
    $ npx tsx cli/vm-manager.tsx
    $ npx tsx cli/vm-manager.tsx run
    $ npx tsx cli/vm-manager.tsx status
`, {
  importMeta: import.meta,
  flags: {}
});

render(<App initialCommand={cli.input[0]} />);