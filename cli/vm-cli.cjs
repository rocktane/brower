#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');
const chalk = require('chalk').default;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const mainMenu = [
  { key: '1', label: '🚀 Quick Start - Run Tests', value: 'run', description: 'Auto-restore from snapshot and run tests' },
  { key: '2', label: '📦 Create New VM', value: 'create', description: 'Create a new test VM' },
  { key: '3', label: '🧹 Create Clean VM (without Homebrew)', value: 'create-clean', description: 'Create truly clean VM and snapshot' },
  { key: '4', label: '📸 Create Snapshot', value: 'snapshot', description: 'Save current VM state' },
  { key: '5', label: '⏮️  Restore from Snapshot', value: 'restore', description: 'Restore VM from saved state' },
  { key: '6', label: '🧪 Run All Tests', value: 'test', description: 'Run complete test suite' },
  { key: '7', label: '🔧 Test Formulae Only', value: 'test formulae', description: 'Test CLI tools only' },
  { key: '8', label: '🖼️  Test Casks Only', value: 'test casks', description: 'Test GUI apps only' },
  { key: '9', label: '🖥️  Interactive Session', value: 'interactive', description: 'Start VM for manual testing' },
  { key: '10', label: '▶️  Start VM', value: 'start', description: 'Boot the VM' },
  { key: '11', label: '⏹️  Stop VM', value: 'stop', description: 'Shutdown the VM' },
  { key: '12', label: '🔗 Connect via SSH', value: 'ssh', description: 'SSH into the VM' },
  { key: '13', label: '📊 Check Status', value: 'status', description: 'View VM and snapshot status' },
  { key: '14', label: '🗑️  Delete VM', value: 'delete', description: 'Remove the VM' },
  { key: '15', label: '💣 Delete All', value: 'delete-all', description: 'Remove VM and snapshots' },
  { key: '0', label: '❌ Exit', value: 'exit', description: 'Exit the CLI' }
];

function executeCommand(command) {
  return new Promise((resolve) => {
    const scriptPath = './scripts/setup-test-vm.sh';
    const args = command.split(' ');
    
    console.log(chalk.yellow(`\n🔄 Running: ${command}...\n`));
    
    const child = spawn(scriptPath, args, {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green(`\n✅ Command completed successfully!\n`));
      } else {
        console.log(chalk.red(`\n❌ Command failed with code ${code}\n`));
      }
      resolve(code);
    });

    child.on('error', (err) => {
      console.error(chalk.red(`\n❌ Error: ${err.message}\n`));
      resolve(1);
    });
  });
}

function showMenu() {
  console.clear();
  console.log(chalk.cyan.bold('🚀 Brower VM Test Manager'));
  console.log(chalk.gray('═'.repeat(50)));
  console.log();
  
  mainMenu.forEach(item => {
    console.log(chalk.yellow(`${item.key.padStart(3)}.`) + ` ${item.label}`);
    if (item.description) {
      console.log(chalk.gray(`      ${item.description}`));
    }
  });
  
  console.log();
  console.log(chalk.gray('═'.repeat(50)));
}

async function handleChoice(choice) {
  const selected = mainMenu.find(item => item.key === choice);
  
  if (!selected) {
    console.log(chalk.red('Invalid choice. Please try again.'));
    return false;
  }
  
  if (selected.value === 'exit') {
    console.log(chalk.cyan('\n👋 Goodbye!\n'));
    return true;
  }
  
  await executeCommand(selected.value);
  
  return new Promise((resolve) => {
    rl.question(chalk.gray('\nPress Enter to continue...'), () => {
      resolve(false);
    });
  });
}

async function main() {
  // Check if command was passed as argument
  const command = process.argv.slice(2).join(' ');
  
  if (command) {
    // Direct command mode
    await executeCommand(command);
    process.exit(0);
  }
  
  // Interactive menu mode
  let shouldExit = false;
  
  while (!shouldExit) {
    showMenu();
    
    await new Promise((resolve) => {
      rl.question(chalk.cyan('Enter your choice: '), async (answer) => {
        shouldExit = await handleChoice(answer.trim());
        resolve();
      });
    });
  }
  
  rl.close();
  process.exit(0);
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log(chalk.cyan('\n\n👋 Goodbye!\n'));
  process.exit(0);
});

main().catch(err => {
  console.error(chalk.red('Error:'), err);
  process.exit(1);
});