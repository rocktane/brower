#!/usr/bin/env node

import inquirer from 'inquirer';
import { spawn } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';

const mainMenuChoices = [
  { name: '🚀 Quick Start - Run Tests', value: 'run', description: 'Auto-restore from snapshot and run tests' },
  { name: '📦 Create New VM', value: 'create', description: 'Create a new test VM' },
  { name: '🧹 Create Clean VM (without Homebrew)', value: 'create-clean', description: 'Create truly clean VM and snapshot' },
  { name: '📸 Snapshot Management', value: 'snapshot-menu', description: 'Create or restore snapshots' },
  { name: '🧪 Test Options', value: 'test-menu', description: 'Various test options' },
  { name: '🖥️  SSH into VM', value: 'ssh-direct', description: 'Open SSH session to VM' },
  { name: '⚙️  VM Operations', value: 'vm-ops', description: 'Start, stop, delete VMs' },
  { name: '📊 Check Status', value: 'status', description: 'View VM and snapshot status' },
  new inquirer.Separator(),
  { name: '❌ Exit', value: 'exit' }
];

const snapshotMenuChoices = [
  { name: '📸 Create Snapshot', value: 'snapshot', description: 'Save current VM state' },
  { name: '⏮️  Restore from Snapshot', value: 'restore', description: 'Restore VM from saved state' },
  new inquirer.Separator(),
  { name: '🔙 Back to Main Menu', value: 'back' }
];

const testMenuChoices = [
  { name: '🧪 Run All Tests', value: 'test', description: 'Run complete test suite' },
  { name: '⚡ Run Tests (Fast - from snapshot)', value: 'fast-clean-run', description: 'Restore snapshot and test' },
  { name: '🧹 Run Tests (Clean - new VM)', value: 'clean-run', description: 'Delete, recreate, and test' },
  { name: '🔧 Test Formulae Only', value: 'test formulae', description: 'Test CLI tools only' },
  { name: '🖼️  Test Casks Only', value: 'test casks', description: 'Test GUI apps only' },
  new inquirer.Separator(),
  { name: '🔙 Back to Main Menu', value: 'back' }
];

const vmOpsMenuChoices = [
  { name: '▶️  Start VM', value: 'start', description: 'Boot the VM' },
  { name: '⏹️  Stop VM', value: 'stop', description: 'Shutdown the VM' },
  { name: '🔗 Connect via SSH (Interactive)', value: 'ssh-interactive', description: 'Open SSH session to VM' },
  { name: '📋 Show SSH Commands', value: 'ssh', description: 'Display SSH connection info' },
  { name: '🗑️  Delete VM', value: 'delete', description: 'Remove the VM' },
  { name: '💣 Delete All (VM + Snapshots)', value: 'delete-all', description: 'Remove everything' },
  new inquirer.Separator(),
  { name: '🔙 Back to Main Menu', value: 'back' }
];

function executeCommand(command) {
  return new Promise((resolve) => {
    const scriptPath = './scripts/setup-test-vm.sh';
    const args = command.split(' ');
    
    console.log(chalk.yellow(`\n🔄 Running: ${command}...\n`));
    
    // Use 'inherit' for stdio to show output in real-time
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

async function showMainMenu() {
  console.log('\n'); // Add spacing
  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: '🚀 Brower VM Test Manager',
      choices: mainMenuChoices,
      pageSize: 15,
      loop: false
    }
  ]);

  return choice;
}

async function showSnapshotMenu() {
  console.log('\n'); // Add spacing
  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: '📸 Snapshot Management',
      choices: snapshotMenuChoices,
      pageSize: 10,
      loop: false
    }
  ]);

  return choice;
}

async function showTestMenu() {
  console.log('\n'); // Add spacing
  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: '🧪 Test Options',
      choices: testMenuChoices,
      pageSize: 10,
      loop: false
    }
  ]);

  return choice;
}

async function showVmOpsMenu() {
  console.log('\n'); // Add spacing
  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: '⚙️  VM Operations',
      choices: vmOpsMenuChoices,
      pageSize: 10,
      loop: false
    }
  ]);

  return choice;
}

async function confirmAction(message) {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message,
      default: false
    }
  ]);

  return confirm;
}

async function waitForEnter() {
  await inquirer.prompt([
    {
      type: 'input',
      name: 'continue',
      message: 'Press Enter to continue...',
      default: ''
    }
  ]);
}

async function main() {
  // Check if command was passed as argument
  const command = process.argv.slice(2).join(' ');
  
  if (command) {
    // Direct command mode
    await executeCommand(command);
    process.exit(0);
  }

  // Interactive mode
  console.clear();
  console.log(chalk.cyan.bold(`
╔════════════════════════════════════════════╗
║     🚀 Brower VM Test Manager CLI 🚀       ║
║         Keyboard Navigation Ready          ║
╚════════════════════════════════════════════╝
`));

  let shouldExit = false;

  while (!shouldExit) {
    try {
      const choice = await showMainMenu();

      switch (choice) {
        case 'exit':
          console.log(chalk.cyan('\n👋 Goodbye!\n'));
          shouldExit = true;
          break;

        case 'snapshot-menu':
          let backToMain = false;
          while (!backToMain) {
            const snapshotChoice = await showSnapshotMenu();
            if (snapshotChoice === 'back') {
              console.clear(); // Clear screen when going back
              backToMain = true;
            } else {
              await executeCommand(snapshotChoice);
              await waitForEnter();
            }
          }
          break;

        case 'test-menu':
          let backToMainTest = false;
          while (!backToMainTest) {
            const testChoice = await showTestMenu();
            if (testChoice === 'back') {
              console.clear(); // Clear screen when going back
              backToMainTest = true;
            } else {
              await executeCommand(testChoice);
              await waitForEnter();
            }
          }
          break;

        case 'vm-ops':
          let backToMainOps = false;
          while (!backToMainOps) {
            const opsChoice = await showVmOpsMenu();
            if (opsChoice === 'back') {
              console.clear(); // Clear screen when going back
              backToMainOps = true;
            } else {
              if (opsChoice === 'delete' || opsChoice === 'delete-all') {
                const confirmed = await confirmAction(
                  `Are you sure you want to ${opsChoice === 'delete-all' ? 'delete ALL VMs and snapshots' : 'delete the VM'}?`
                );
                if (confirmed) {
                  await executeCommand(opsChoice);
                  await waitForEnter();
                }
              } else if (opsChoice === 'ssh-interactive') {
                console.log(chalk.cyan('\n🔗 Opening SSH connection to VM...\n'));
                console.log(chalk.gray('To exit SSH session, type "exit" and press Enter\n'));
                
                // Get VM IP using tart directly
                const getIpChild = spawn('/opt/homebrew/bin/tart', ['ip', 'brower-test'], {
                  stdio: 'pipe',
                  shell: false
                });
                
                let vmIp = '';
                getIpChild.stdout.on('data', (data) => {
                  vmIp = data.toString().trim();
                });
                
                await new Promise(resolve => getIpChild.on('close', resolve));
                
                if (vmIp) {
                  // Open SSH session directly
                  const sshChild = spawn('ssh', [`admin@${vmIp}`], {
                    stdio: 'inherit',
                    shell: false
                  });
                  
                  await new Promise(resolve => sshChild.on('close', resolve));
                } else {
                  console.log(chalk.red('Could not get VM IP. Make sure the VM is running.'));
                  await waitForEnter();
                }
              } else {
                await executeCommand(opsChoice);
                if (opsChoice !== 'ssh') {
                  await waitForEnter();
                }
              }
            }
          }
          break;

        case 'ssh-direct':
        case 'ssh-interactive':
          console.log(chalk.cyan('\n🔗 Checking VM status...\n'));
          
          // First check if VM is running
          const checkStatusChild = spawn('/opt/homebrew/bin/tart', ['list'], {
            stdio: 'pipe',
            shell: false
          });
          
          let vmRunning = false;
          checkStatusChild.stdout.on('data', (data) => {
            const output = data.toString();
            if (output.includes('brower-test') && output.includes('running')) {
              vmRunning = true;
            }
          });
          
          await new Promise(resolve => checkStatusChild.on('close', resolve));
          
          // If VM not running, start it
          if (!vmRunning) {
            console.log(chalk.yellow('VM is not running. Starting it now...\n'));
            await executeCommand('start');
            // Wait a bit for VM to be ready
            console.log(chalk.cyan('Waiting for VM to be ready...\n'));
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
          
          // Now get VM IP
          console.log(chalk.cyan('Getting VM IP address...\n'));
          const getIpChild = spawn('/opt/homebrew/bin/tart', ['ip', 'brower-test'], {
            stdio: 'pipe',
            shell: false
          });
          
          let vmIp = '';
          getIpChild.stdout.on('data', (data) => {
            vmIp = data.toString().trim();
          });
          
          getIpChild.stderr.on('data', (data) => {
            // Ignore stderr
          });
          
          await new Promise(resolve => getIpChild.on('close', resolve));
          
          if (vmIp && vmIp !== '') {
            console.log(chalk.green(`✅ VM is ready at ${vmIp}\n`));
            console.log(chalk.cyan('Opening SSH connection...'));
            console.log(chalk.gray('To exit SSH session, type "exit" and press Enter\n'));
            console.log(chalk.yellow('Password: admin\n'));
            
            // Open SSH session directly
            const sshChild = spawn('ssh', ['-o', 'StrictHostKeyChecking=no', '-o', 'UserKnownHostsFile=/dev/null', `admin@${vmIp}`], {
              stdio: 'inherit',
              shell: false
            });
            
            await new Promise(resolve => sshChild.on('close', resolve));
            console.log(chalk.gray('\nSSH session closed. Returning to menu...\n'));
          } else {
            console.log(chalk.red('\n❌ Could not get VM IP. There might be a problem with the VM.\n'));
            await waitForEnter();
          }
          break;

        default:
          await executeCommand(choice);
          if (choice !== 'ssh' && choice !== 'interactive') {
            await waitForEnter();
          }
          break;
      }
    } catch (error) {
      if (error.name === 'ExitPromptError') {
        console.log(chalk.cyan('\n👋 Goodbye!\n'));
        shouldExit = true;
      } else {
        console.error(chalk.red('Error:'), error);
        await waitForEnter();
      }
    }
  }

  process.exit(0);
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log(chalk.cyan('\n\n👋 Goodbye!\n'));
  process.exit(0);
});

// Run the CLI
main().catch(err => {
  console.error(chalk.red('Fatal error:'), err);
  process.exit(1);
});