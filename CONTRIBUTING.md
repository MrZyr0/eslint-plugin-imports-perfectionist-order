# Contributing to eslint-plugin-imports-perfectionist-order

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Be respectful and inclusive. We're committed to providing a welcoming and inspiring community for all.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Yarn 4.10.3 or higher

### Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/eslint-plugin-imports-perfectionist-order.git`
3. Install dependencies: `yarn install`

## Development Workflow

### Running Tests

```bash
yarn test
```

### Linting

```bash
# Check for linting errors
yarn lint

# Fix linting errors automatically
yarn lint:fix
```

### Making Changes

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Write or update tests for your changes
4. Run `yarn lint:fix` to ensure code quality
5. Run `yarn test` to ensure all tests pass
6. Commit your changes with a descriptive message

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `test:` for test changes
- `refactor:` for code refactoring
- `chore:` for build process, dependencies, etc.

Examples:

- `feat: add support for custom sort strategies`
- `fix: correct regex pattern for internal imports`
- `docs: update README with examples`

## Pull Request Process

1. Update the README.md with any new features or changes
2. Ensure all tests pass: `yarn test`
3. Ensure linting passes: `yarn lint`
4. Create a pull request with a clear description of your changes
5. Link any related issues

## Testing

- Add tests for any new functionality
- Ensure existing tests still pass
- Aim for high test coverage

## Code Style

This project uses ESLint for code quality. Configuration is in `eslint.config.mjs`.

Key rules:

- Use 2-space indentation
- Use single quotes for strings
- Use semicolons
- Use `const` and `let`, not `var`
- Use arrow functions when appropriate

## Reporting Issues

- Use the GitHub issue tracker
- Provide a clear description of the issue
- Include steps to reproduce if applicable
- Include your environment (Node.js version, ESLint version, etc.)

## Questions?

Feel free to open an issue or discussion for any questions.

Thank you for contributing!
