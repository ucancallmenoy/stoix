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

const args = process.argv.slice(2);
const command = args[0];
const projectName = args[1];

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
  npx stoix create <project-name>

${chalk.bold('Commands:')}
  create <name>    Scaffold a new Stoix project

${chalk.bold('Examples:')}
  npx stoix create my-app
  npx stoix create blog-api
`);
}

function validateProjectName(name: string): boolean {
  const validPattern = /^[a-zA-Z][a-zA-Z0-9._-]*$/;
  return validPattern.test(name);
}

async function createProject(name: string): Promise<void> {
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

  console.log(chalk.cyan('\n  Installing dependencies...\n'));
  let dependenciesInstalled = true;
  try {
    execSync('npm install', {
      cwd: targetDir,
      stdio: 'inherit',
    });
  } catch {
    dependenciesInstalled = false;
    console.error(chalk.yellow('\n  Warning: npm install failed. Run it manually.'));
  }

  const statusLine = dependenciesInstalled
    ? chalk.green.bold('  + Stoix project is ready!')
    : chalk.yellow.bold('  ! Stoix project files are ready (dependencies not installed)');
  const installStep = dependenciesInstalled ? '' : `    ${chalk.cyan('npm install')}\n`;

  console.log(`
${statusLine}

${chalk.bold('  Next steps:')}
    ${chalk.cyan(`cd ${name}`)}
${installStep}    ${chalk.cyan('npm run dev')}

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

  await createProject(projectName);
}

main().catch((err: Error) => {
  console.error(chalk.red('\n  Error:'), err.message);
  process.exit(1);
});
