# eslint-plugin-imports-perfectionist-order

| `main` / `latest`                                                                                                                                                                                                                                                  | `develop`                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![npm version (latest)](https://img.shields.io/npm/v/eslint-plugin-imports-perfectionist-order/latest.svg)](https://www.npmjs.com/package/eslint-plugin-imports-perfectionist-order)                                                                              | [![npm version (develop)](https://img.shields.io/npm/v/eslint-plugin-imports-perfectionist-order/develop.svg)](https://www.npmjs.com/package/eslint-plugin-imports-perfectionist-order)                                                                                |
| [![Build Status (latest)](https://github.com/MrZyr0/eslint-plugin-imports-perfectionist-order/actions/workflows/tests-publish.yml/badge.svg?branch=main)](https://github.com/MrZyr0/eslint-plugin-imports-perfectionist-order/actions/workflows/tests-publish.yml) | [![Build Status (develop)](https://github.com/MrZyr0/eslint-plugin-imports-perfectionist-order/actions/workflows/tests-publish.yml/badge.svg?branch=develop)](https://github.com/MrZyr0/eslint-plugin-imports-perfectionist-order/actions/workflows/tests-publish.yml) |

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

ESLint plugin to sort imports with fully configurable strategies. Allows you to define custom sorting rules for your project's imports.

## Features

- **Multiple sorting strategies**: Sort by line length, path depth, filename or alphabetically
- **Grouping support**: Separate external and internal imports
- **Flexible configuration**: Combine strategies in any order
- **Auto-fix**: Automatically fixes import order issues
- **TypeScript support**: Works seamlessly with TypeScript and modern JavaScript projects

## Requirements

- **Node.js**: >= 18.0.0
- **ESLint**: >= 8.0.0
- **Yarn**: >= 4.10.3 (recommended) or npm >= 9.0.0

> **Compatibility Note**: See [COMPATIBILITY.md](./COMPATIBILITY.md) for details on compatibility with different Node.js and ESLint versions.

## Table of content

- [eslint-plugin-imports-perfectionist-order](#eslint-plugin-imports-perfectionist-order)
  - [Features](#features)
  - [Requirements](#requirements)
  - [Table of content](#table-of-content)
  - [Installation](#installation)
  - [Quick Start](#quick-start)
    - [Default configuration](#default-configuration)
      - [Flat (ESLint 9+)](#flat-eslint-9)
      - [Legacy (ESLint \< 9)](#legacy-eslint--9)
    - [Custom configuration](#custom-configuration)
      - [Flat (ESLint 9+)](#flat-eslint-9-1)
      - [Legacy (ESLint \< 9)](#legacy-eslint--9-1)
  - [Configuration options](#configuration-options)
    - [`groups` (boolean, default: `true`)](#groups-boolean-default-true)
    - [`internalPattern` (string, default : `^(@/|\\.\\.?/)`)](#internalpattern-string-default--)
    - [`sortStrategies` (array of strategies, default : `[PATH_TREE_DEPTH, FILENAME, ALPHABETICAL, LINE_LENGTH]`)](#sortstrategies-array-of-strategies-default--path_tree_depth-filename-alphabetical-line_length)
      - [Strategies](#strategies)
        - [1. `lineLength`](#1-linelength)
        - [2. `pathTree`](#2-pathtree)
        - [3. `alphabetical`](#3-alphabetical)
        - [4. `filename`](#4-filename)
    - [Examples](#examples)
      - [Example 1: Sort by line length, then alphabetically (with grouping)](#example-1-sort-by-line-length-then-alphabetically-with-grouping)
      - [Example 2: Sort by path tree depth, then alphabetically (no grouping)](#example-2-sort-by-path-tree-depth-then-alphabetically-no-grouping)
      - [Example 3: Alphabetical sort with grouping](#example-3-alphabetical-sort-with-grouping)
  - [Development](#development)
  - [Reporting Issues](#reporting-issues)
    - [How to Report a Bug](#how-to-report-a-bug)
    - [Required Information](#required-information)
  - [Questions?](#questions)
  - [Acknowledgments](#acknowledgments)
  - [License](#license)

## Installation

```bash
# Using npm
npm install --save-dev eslint-plugin-imports-perfectionist-order

# Using Yarn (recommended)
yarn add -D eslint-plugin-imports-perfectionist-order

# Using pnpm
pnpm add -D eslint-plugin-imports-perfectionist-order
```

## Quick Start

### Default configuration

#### Flat (ESLint 9+)

```javascript
// eslint.config.js
export default [
	{
		plugins: { 'imports-perfectionist-order': import('eslint-plugin-imports-perfectionist-order') },
		rules: { 'imports-perfectionist-order/sort': ['error'] },
	},
];
```

#### Legacy (ESLint < 9)

```javascript
// .eslintrc.js
module.exports = {
	plugins: ['imports-perfectionist-order'],
	rules: { 'imports-perfectionist-order/sort': ['error'] },
};
```

### Custom configuration

#### Flat (ESLint 9+)

```javascript
// eslint.config.js
export default [
	{
		plugins: { 'imports-perfectionist-order': import('eslint-plugin-imports-perfectionist-order') },
		rules: {
			'imports-perfectionist-order/sort': [
				'error',
				{
					groups: true,
					internalPattern: '^(@/|\\.\\.?/)',
					sortStrategies: ['pathTree', 'alphabetical'],
				},
			],
		},
	},
];
```

#### Legacy (ESLint < 9)

```javascript
// .eslintrc.js
module.exports = {
	plugins: ['imports-perfectionist-order'],
	rules: {
		'imports-perfectionist-order/sort': [
			'error',
			{
				groups: true,
				internalPattern: '^(@/|\\.\\.?/)',
				sortStrategies: ['pathTree', 'alphabetical'],
			},
		],
	},
};
```

## Configuration options

### `groups` (boolean, default: `true`)

Defines whether external and internal imports should be grouped separately. When enabled, external imports appear first, followed by internal imports.

**Accepted values:**

- `true`: Enables grouping (default)
- `false`: Disables grouping

**Example:**

```javascript
// groups: true
import express from 'express';
import lodash from 'lodash';
import config from '../config'; // Internal (starts with '../')
import utils from './utils'; // Internal (starts with './')

// groups: false
import config from '../config';
import express from 'express';
import lodash from 'lodash';
import utils from './utils';
```

### `internalPattern` (string, default : `^(@/|\\.\\.?/)`)

Regular expression pattern to identify internal imports. By default, matches:

- `^@/` : import aliases (as used in projects with path aliases)
- `^\.\.?/` : relative imports (`./` or `../`)

**Example:**

```javascript
// To also consider paths starting with 'src/' as internal
{
  internalPattern: '^(src/|@/|\\.\\.?/)',
  groups: true
}
```

### `sortStrategies` (array of strategies, default : `[PATH_TREE_DEPTH, FILENAME, ALPHABETICAL, LINE_LENGTH]`)

Which strategies should be applied one after another over the result of the previous applied strategies.

**Example:**

```javascript
// Simple ASC by default strategies
{
  sortStrategies: ['pathTree', 'alphabetical']
}

// Advanced strategies direction
{
	sortStrategies: [
		{ strategy: SortStrategy.PATH_TREE_DEPTH, direction: SortDirection.ASC },
		{ strategy: SortStrategy.FILENAME, direction: SortDirection.ASC },
		{ strategy: SortStrategy.ALPHABETICAL, direction: SortDirection.ASC },
		{ strategy: SortStrategy.LINE_LENGTH, direction: SortDirection.ASC },
	],
}
```

#### Strategies

The plugin offers several sorting strategies that you can combine according to your needs.

##### 1. `lineLength`

Sorts imports by line length (from shortest to longest).

**Benefits** :

- Improves readability with short imports at the top
- Reduces Git merge conflicts

**Example** :

```javascript
// Before
import { veryLongNamedUtility } from './utils/very-long-path/very-long-named-utility';
import { config } from './config';
import { api } from './api';

// After
import { api } from './api';
import { config } from './config';
import { veryLongNamedUtility } from './utils/very-long-path/very-long-named-utility';
```

##### 2. `pathTree`

Sorts by path depth (from deepest to shallowest).

**Example** :

```javascript
// Before
import { utils } from '../../utils';
import { api } from '../../../api';
import { config } from './config';

// After
import { api } from '../../../api';
import { utils } from '../../utils';
import { config } from './config';
```

##### 3. `alphabetical`

Sorts imports alphabetically.

**Example** :

```javascript
// Before
import { z } from 'z';
import { a } from 'a';
import { m } from 'm';

// After
import { a } from 'a';
import { m } from 'm';
import { z } from 'z';
```

##### 4. `filename`

Sorts imports by filename (last part of the path).

**Example** :

```javascript
// Before
import { utils } from './utils';
import { config } from './config';
import { api } from '../api';

// After
import { api } from '../api';
import { config } from './config';
import { utils } from './utils';
```

### Examples

#### Example 1: Sort by line length, then alphabetically (with grouping)

```javascript
// Configuration
{
  "groups": true,
  "sortStrategies": ["lineLength", "alphabetical"]
}

// Before
import lodash from 'lodash';
import express from 'express';
import fs from 'fs';
import utils from './utils';

// After
import fs from 'fs';
import lodash from 'lodash';
import express from 'express';

import utils from './utils';
```

#### Example 2: Sort by path tree depth, then alphabetically (no grouping)

```javascript
// Configuration
{
  "groups": false,
  "sortStrategies": ["pathTreeDepth", "alphabetical"]
}

// Before
import utils from './utils';
import config from '../config';
import helper from '../../helper';

// After
import helper from '../../helper';
import config from '../config';
import utils from './utils';
```

#### Example 3: Alphabetical sort with grouping

```javascript
// Configuration
{
  "groups": true,
  "sortStrategies": ["alphabetical"]
}

// Before
import utils from './utils';
import express from 'express';
import fs from 'fs';

// After
import express from 'express';
import fs from 'fs';

import utils from './utils';
```

## Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) for tutorial and guidelines.

## Reporting Issues

Before reporting an issue, please check if it hasn't been already reported in the [GitHub issues](https://github.com/MrZyr0/eslint-plugin-imports-perfectionist-order/issues).

### How to Report a Bug

1. Use the provided bug report template
2. Include a clear, descriptive title
3. Describe the expected and actual behavior
4. Provide steps to reproduce the issue
5. Include relevant code snippets

### Required Information

- Plugin version
- ESLint version
- Node.js version
- ESLint configuration used
- Affected files (if applicable)
- Complete error messages

## Questions?

If you have questions or need help getting started, feel free to:

1. Check the [documentation](README.md)
2. Browse existing [issues](https://github.com/MrZyr0/eslint-plugin-imports-perfectionist-order/issues)
3. Open an [issue](https://github.com/MrZyr0/eslint-plugin-imports-perfectionist-order/issues/new/choose) if your question hasn't been asked

## Acknowledgments

Thank you for contributing to this project! Your time and effort are greatly appreciated.

## License

[MIT License](https://github.com/MrZyr0/eslint-plugin-imports-perfectionist-order?tab=MIT-1-ov-file)
