# Development Guide

This guide explains how to set up your development environment and contribute to `eslint-plugin-imports-perfectionist-order`.

## Table of Contents

- [Development Guide](#development-guide)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Initial Setup](#initial-setup)
    - [Using Volta (Recommended)](#using-volta-recommended)
    - [Using nvm](#using-nvm)
  - [Available Commands](#available-commands)
    - [Development](#development)
    - [Linting \& Formatting](#linting--formatting)
  - [Code Architecture](#code-architecture)
    - [Key Entry Points](#key-entry-points)
  - [Release Process](#release-process)
  - [Coding Style](#coding-style)
  - [Troubleshooting](#troubleshooting)
    - ["Cannot find module" errors with PnP](#cannot-find-module-errors-with-pnp)
    - [ESLint not finding rules](#eslint-not-finding-rules)
    - [Version conflicts](#version-conflicts)
  - [Getting Help](#getting-help)
  - [Resources](#resources)

## Prerequisites

- **Node.js**: 20.x or higher (LTS recommended)
- **Yarn**: 4.10.x or higher (recommended)
- **Git**: 2.52.x or higher
- **Volta** (recommended) or **nvm** for Node.js version management

## Initial Setup

### Using Volta (Recommended)

[Volta](https://volta.sh/) is a JavaScript tool manager that automatically manages your toolchain.

```bash
# Install Volta (one-time setup)
curl https://get.volta.sh | bash

# Activate Volta in the current shell
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"

# Exit the project folder and reopen it to activate Volta.
cd ../
cd eslint-plugin-imports-perfectionist-order
```

### Using nvm

If you prefer using nvm:

```bash
# Install nvm (one-time setup)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Activate nvm in the current shell
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install required Node.js version
nvm install 20
nvm use 20

# Install Yarn
npm install -g yarn@4.10.3
```

## Available Commands

### Development

```bash
# Run all tests
yarn test
```

### Linting & Formatting

```bash
# Format code
yarn format

# Check code style
yarn lint

# Automatically fix style issues
yarn lint:fix
```

## Code Architecture

### Key Entry Points

- `lib/rules/sort.js` - Main sorting rule implementation
- `tests/lib/rules/sort.test.js` - Tests for the sorting rule
- `index.js` - Plugin entry point

## Release Process

1. **Create a branch** for your feature or fix following [the conventional commits standard](https://www.conventionalcommits.org/)
2. Write clear, well-documented code
3. Add tests for new functionality
4. Update documentation as needed
5. Check your code using [available commands](#available-commands)
6. Commit your changes atomically following [conventional commits standard](https://www.conventionalcommits.org/)
7. Push to `develop`
8. Wait CI to execute, fix errors if any occur
9. Try your changes in a test project
10. Propose your changes to the original repo via a pull request to `develop`
11. Wait for the PR to be reviewed and merged
12. Use `develop` tag to enjoy your contribution directly
13. Wait for the PR to be merged into `main`
14. Thank you for your contribution!

If you wish to use directly your forked repo, don't hesitate to edit [the workflow](.github/workflows/tests-publish.yml) to publish your repo.

## Coding Style

This project uses Prettier and ESLint for code quality. Key rules:

- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Always
- **Variables**: `const` by default, `let` when needed
- **Line Length**: 100 characters maximum
- **Trailing Commas**: Yes
- **Functions**: Arrow functions only when appropriate on single callback usage

## Troubleshooting

### "Cannot find module" errors with PnP

```bash
# Regenerate PnP files
yarn install

# Clear cache
yarn cache clean
```

### ESLint not finding rules

```bash
# Reinstall dependencies
rm -rf .yarn/cache
yarn install
```

### Version conflicts

```bash
# Check installed versions
yarn why eslint
yarn why mocha

# Update to compatible versions
yarn upgrade
```

## Getting Help

- Review [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines
- Open an issue on GitHub
- Check existing issues and discussions

## Resources

- [Volta Documentation](https://docs.volta.sh/)
- [Yarn PnP Documentation](https://yarnpkg.com/features/pnp)
- [ESLint Documentation](https://eslint.org/docs/developer-guide/working-with-plugins)
- [ESLint Plugin Development](https://eslint.org/docs/latest/extend/plugins)
- [ESLint Rules Guide](https://eslint.org/docs/developer-guide/working-with-rules)
- [Mocha Testing Framework](https://mochajs.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
