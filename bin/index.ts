#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STOIX_VERSION: string =
  fs.readJsonSync(path.resolve(__dirname, '..', '..', 'package.json')).version || '0.1.0';

interface CliOptions {
  pm?: 'npm' | 'yarn' | 'pnpm' | 'bun';
  install: boolean;
  git: boolean;
  yes: boolean;
}

function parseArgs(args: string[]): { command: string; projectName: string; options: CliOptions } {
  const options: CliOptions = {
    install: true,
    git: false,
    yes: false,
  };

  let command = '';
  let projectName = '';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h' || arg === '--version' || arg === '-v') {
      command = arg;
      break;
    }

    if (arg === '--no-install') {
      options.install = false;
    } else if (arg === '--git') {
      options.git = true;
    } else if (arg === '--yes' || arg === '-y') {
      options.yes = true;
    } else if (arg === '--pm') {
      const pm = args[++i];
      if (pm === 'npm' || pm === 'yarn' || pm === 'pnpm' || pm === 'bun') {
        options.pm = pm;
      } else {
        console.error(chalk.red(`\n  Error: Invalid package manager "${pm}". Use: npm, yarn, pnpm, or bun\n`));
        process.exit(1);
      }
    } else if (!arg.startsWith('-')) {
      if (!command) {
        command = arg;
      } else if (!projectName) {
        projectName = arg;
      }
    }
  }

  return { command, projectName, options };
}

const { command, projectName, options } = parseArgs(process.argv.slice(2));

function printBanner(): void {
  console.log(
    chalk.cyan(`
  ===================================
           Stoix v${STOIX_VERSION}
      Node + Express + React + Vite
  ===================================
`)
  );
}

function printUsage(): void {
  printBanner();
  console.log(`${chalk.bold('Usage:')}
  npx stoix create <project-name> [options]

${chalk.bold('Commands:')}
  create <name>      Scaffold a new Stoix project

${chalk.bold('Options:')}
  --pm <manager>     Package manager to use (npm, yarn, pnpm, bun)
  --no-install       Skip dependency installation
  --git              Initialize git repository
  --yes, -y          Skip prompts and use defaults
  --help, -h         Show this help message
  --version, -v      Show version number

${chalk.bold('Examples:')}
  npx stoix create my-app
  npx stoix create blog-api --pm pnpm --git
  npx stoix create my-project --no-install --yes
`);
}

function validateProjectName(name: string): boolean {
  const validPattern = /^[a-zA-Z][a-zA-Z0-9._-]*$/;
  return validPattern.test(name);
}

function detectPackageManager(): 'npm' | 'yarn' | 'pnpm' | 'bun' {
  try {
    execSync('bun --version', { stdio: 'ignore' });
    return 'bun';
  } catch {}
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    return 'pnpm';
  } catch {}
  try {
    execSync('yarn --version', { stdio: 'ignore' });
    return 'yarn';
  } catch {}
  return 'npm';
}

function getInstallCommand(pm: 'npm' | 'yarn' | 'pnpm' | 'bun'): string {
  return pm === 'npm' ? 'npm install' : `${pm} install`;
}

function getDevCommand(pm: 'npm' | 'yarn' | 'pnpm' | 'bun'): string {
  return pm === 'npm' ? 'npm run dev' : `${pm} dev`;
}

async function createProject(name: string, opts: CliOptions): Promise<void> {
  const targetDir = path.resolve(process.cwd(), name);

  if (fs.existsSync(targetDir)) {
    console.error(chalk.red(`\n  Error: Directory "${name}" already exists.\n`));
    process.exit(1);
  }

  printBanner();
  console.log(chalk.cyan(`  Creating Stoix project: ${chalk.bold(name)}\n`));

  // Resolve template directory (relative to compiled dist/bin/index.js -> ../../template)
  const templateDir = path.resolve(__dirname, '..', '..', 'template');

  if (!fs.existsSync(templateDir)) {
    console.error(chalk.red('  Error: Template directory not found.'));
    console.error(chalk.dim(`  Expected at: ${templateDir}`));
    process.exit(1);
  }

  fs.copySync(templateDir, targetDir, { overwrite: false });
  console.log(chalk.green('  + Project files created'));

  // Never scaffold a real .env file; keep only .env.example.
  const envFilePath = path.join(targetDir, '.env');
  if (fs.existsSync(envFilePath)) {
    fs.removeSync(envFilePath);
  }

  const gitignoreSrc = path.join(targetDir, 'gitignore');
  const gitignoreDest = path.join(targetDir, '.gitignore');
  if (fs.existsSync(gitignoreSrc)) {
    fs.renameSync(gitignoreSrc, gitignoreDest);
  }

  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = fs.readJsonSync(pkgPath);
  pkg.name = name;
  fs.writeJsonSync(pkgPath, pkg, { spaces: 2 });
  console.log(chalk.green('  + package.json configured'));

  // Determine package manager
  const pm = opts.pm || detectPackageManager();
  console.log(chalk.dim(`  Using package manager: ${pm}`));

  // Install dependencies
  let dependenciesInstalled = false;
  if (opts.install) {
    console.log(chalk.cyan('\n  Installing dependencies...\n'));
    try {
      execSync(getInstallCommand(pm), {
        cwd: targetDir,
        stdio: 'inherit',
      });
      dependenciesInstalled = true;
    } catch {
      console.error(chalk.yellow('\n  Warning: dependency installation failed. Run it manually.'));
    }
  } else {
    console.log(chalk.yellow('\n  Skipping dependency installation (--no-install)'));
  }

  // Initialize git repository
  if (opts.git) {
    console.log(chalk.cyan('\n  Initializing git repository...\n'));
    try {
      execSync('git init', {
        cwd: targetDir,
        stdio: 'inherit',
      });
      execSync('git add .', {
        cwd: targetDir,
        stdio: 'ignore',
      });
      execSync('git commit -m "Initial commit from Stoix"', {
        cwd: targetDir,
        stdio: 'ignore',
      });
      console.log(chalk.green('  + Git repository initialized'));
    } catch {
      console.error(chalk.yellow('  Warning: git initialization failed'));
    }
  }

  // Print success message
  const statusLine = dependenciesInstalled
    ? chalk.green.bold('  + Stoix project is ready!')
    : chalk.yellow.bold('  ! Stoix project files are ready' + (opts.install ? ' (dependencies not installed)' : ''));
  const installStep = opts.install && !dependenciesInstalled ? `    ${chalk.cyan(getInstallCommand(pm))}\n` : '';

  console.log(`
${statusLine}

${chalk.bold('  Next steps:')}
    ${chalk.cyan(`cd ${name}`)}
${installStep}    ${chalk.cyan(getDevCommand(pm))}

${chalk.dim('  Stoix app will run at http://localhost:3000')}
`);
}

async function main(): Promise<void> {
  if (!command || command === '--help' || command === '-h') {
    printUsage();
    process.exit(0);
  }

  if (command === '--version' || command === '-v') {
    console.log(`stoix v${STOIX_VERSION}`);
    process.exit(0);
  }

  if (command !== 'create') {
    console.error(chalk.red(`\n  Unknown command: "${command}"\n`));
    printUsage();
    process.exit(1);
  }

  if (!projectName) {
    console.error(chalk.red('\n  Error: Please provide a project name.\n'));
    console.log(chalk.dim('    npx stoix create <project-name>\n'));
    process.exit(1);
  }

  if (!validateProjectName(projectName)) {
    console.error(
      chalk.red(
        '\n  Error: Project name must start with a letter and contain only letters, numbers, hyphens, dots, or underscores.\n'
      )
    );
    process.exit(1);
  }

  await createProject(projectName, options);
}

main().catch((err: Error) => {
  console.error(chalk.red('\n  Error:'), err.message);
  process.exit(1);
});
