# Development Guide

This guide explains how to set up your development environment and contribute to eslint-plugin-imports-perfectionist-order.

## Quick Start

### Prerequisites

- **Volta** (recommended) or **nvm** for Node.js version management
- **Git**

### Setup with Volta

```bash
# Install Volta (one-time)
curl https://get.volta.sh | bash

# Clone the repository
git clone https://github.com/MrZyr0/eslint-plugin-imports-perfectionist-order.git
cd eslint-plugin-imports-perfectionist-order

# Volta automatically uses Node 25.0.0 and Yarn 4.10.3
yarn install
```

### Setup with nvm

```bash
# Clone the repository
git clone https://github.com/MrZyr0/eslint-plugin-imports-perfectionist-order.git
cd eslint-plugin-imports-perfectionist-order

# Install Node.js 25
nvm install 25
nvm use 25

# Install Yarn globally
npm install -g yarn@4.10.3

# Install dependencies
yarn install
```

## Available Commands

```bash
# Run linting
yarn lint

# Fix linting issues automatically
yarn lint:fix

# Run tests
yarn test

# Check Node.js version
yarn check:node

# Check ESLint version
yarn check:eslint
```

## Project Structure

```
eslint-plugin-imports-perfectionist-order/
├── lib/
│   └── rules/
│       └── sort.js          # Main rule implementation
├── tests/
│   └── lib/
│       └── rules/
│           └── sort.test.js  # Rule tests
├── index.js                 # Plugin entry point
├── package.json             # Project metadata
├── .yarnrc.yml              # Yarn PnP configuration
├── eslint.config.js         # ESLint configuration
└── README.md                # User documentation
```

## Understanding Yarn PnP

This project uses Yarn PnP (Plug'n'Play) for:

- **Faster installs**: No node_modules directory
- **Better security**: Explicit dependency resolution
- **Reproducible builds**: Exact versions locked in `.pnp.cjs`

### Important Files

- `.yarnrc.yml`: Yarn PnP configuration
- `.pnp.cjs`: Generated dependency map (commit to git)
- `.pnp.loader.mjs`: ESM loader for PnP (commit to git)

### Working with PnP

```bash
# Install dependencies
yarn install

# Add a new dependency
yarn add -D package-name

# Remove a dependency
yarn remove package-name

# Update dependencies
yarn upgrade
```

## Making Changes

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

Edit files in `lib/rules/` or `tests/` as needed.

### 3. Run Tests and Linting

```bash
# Run all checks
yarn lint && yarn test

# Or fix issues automatically
yarn lint:fix && yarn test
```

### 4. Commit Your Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat: add new sorting strategy"
```

### 5. Push and Create a Pull Request

```bash
git push origin feature/your-feature-name
```

## Testing

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode (if supported by mocha)
yarn test --watch

# Run specific test file
yarn test tests/lib/rules/sort.test.js
```

### Writing Tests

Tests use Mocha and ESLint's RuleTester. See `tests/lib/rules/sort.test.js` for examples.

### Test Coverage

We aim for high test coverage. When adding features:

1. Write tests for the new functionality
2. Ensure existing tests still pass
3. Check that edge cases are covered

## Debugging

### Enable Debug Output

```bash
# With Node.js debugger
node --inspect-brk ./node_modules/.bin/mocha tests

# With console logging
# Add console.log() to your code and run tests
yarn test
```

### Using VS Code Debugger

Add to `.vscode/launch.json`:

```json
{
	"version": "0.2.0",
	"configurations": [
		{
			"type": "node",
			"request": "launch",
			"name": "Mocha Tests",
			"program": "${workspaceFolder}/node_modules/.bin/mocha",
			"args": ["tests"],
			"console": "integratedTerminal",
			"internalConsoleOptions": "neverOpen"
		}
	]
}
```

## Code Style

This project uses ESLint for code quality. Key rules:

- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Always
- **Variables**: `const` by default, `let` when needed
- **Functions**: Arrow functions when appropriate

Configuration is in `eslint.config.mjs`.

## Before Submitting a PR

1. ✅ Run `yarn lint:fix` to fix style issues
2. ✅ Run `yarn test` to ensure all tests pass
3. ✅ Update documentation if needed
4. ✅ Follow [Conventional Commits](https://www.conventionalcommits.org/)
5. ✅ Link related issues in PR description

## Release Process

Releases are automated using Semantic Release:

1. Commits are analyzed for version bumps (major/minor/patch)
2. CHANGELOG.md is automatically generated
3. Package is published to npm
4. GitHub release is created

See `.releaserc.json` for configuration.

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

- Check [COMPATIBILITY.md](./COMPATIBILITY.md) for version info
- Review [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines
- Open an issue on GitHub
- Check existing issues and discussions

## Resources

- [Volta Documentation](https://docs.volta.sh/)
- [Yarn PnP Documentation](https://yarnpkg.com/features/pnp)
- [ESLint Plugin Development](https://eslint.org/docs/latest/extend/plugins)
- [Mocha Testing Framework](https://mochajs.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
