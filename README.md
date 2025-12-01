# eslint-plugin-imports-perfectionist-order

ESLint plugin to sort imports with fully configurable strategies. Allows you to define custom sorting rules for your project's imports.

## Features

- **Multiple sorting strategies**: Sort by line length, path tree depth, or alphabetically
- **Grouping support**: Optionally group external and internal imports separately
- **Flexible configuration**: Combine strategies in any order
- **Auto-fix**: Automatically fixes import order issues

## Requirements

- **Node.js**: >= 18.0.0
- **ESLint**: >= 8.0.0

## Installation

```bash
npm install --save-dev eslint-plugin-imports-perfectionist-order
# or
yarn add -D eslint-plugin-imports-perfectionist-order
```

For compatibility information with different versions, see [COMPATIBILITY.md](./COMPATIBILITY.md).

## Usage

### Flat Config (ESLint 9+)

```javascript
// eslint.config.js
import importsPerfectionistOrder from 'eslint-plugin-imports-perfectionist-order';

export default [
	{
		plugins: { 'imports-perfectionist-order': importsPerfectionistOrder },
		rules: {
			'imports-perfectionist-order/sort-imports': [
				'error',
				{ groups: true, internalPattern: '^@/', sortStrategies: ['lineLength', 'alphabetical'] },
			],
		},
	},
];
```

### Legacy Config

```javascript
// .eslintrc.js
module.exports = {
	plugins: ['imports-perfectionist-order'],
	rules: {
		'imports-perfectionist-order/sort-imports': [
			'error',
			{
				groups: true,
				internalPattern: '^(@/|\\.\\.?/)',
				sortStrategies: ['lineLength', 'alphabetical'],
			},
		],
	},
};
```

## Options

### `groups` (boolean, default: `true`)

Whether to group external and internal imports separately. When enabled, external imports appear first, followed by internal imports.

```javascript
// groups: true
import express from 'express';
import utils from './utils';
import lodash from 'lodash';
import config from '../config';

// groups: false
import express from 'express';
import lodash from 'lodash';
import utils from './utils';
import config from '../config';
```

### `internalPattern` (string, default: `^(@/|\\.\\.?/)`)

Regex pattern to identify internal imports. By default, matches:

- `@/` (alias imports)
- `./` (relative imports in current directory)
- `../` (relative imports in parent directories)

```javascript
// Custom pattern for monorepo
"internalPattern": "^(@app/|@lib/|\\.\\.?/)"
```

### `sortStrategies` (array, default: `['lineLength', 'alphabetical']`)

Array of sorting strategies to apply in order. Available strategies:

#### `lineLength`

Sorts imports by their line length (shortest first).

```javascript
import a from 'a';
import express from 'express';
import lodash from 'lodash';
```

#### `pathTreeDepth`

Sorts imports by path depth (deepest first), then by path name.

```javascript
import helper from '../../helper';
import config from '../config';
import utils from './utils';
```

#### `alphabetical`

Sorts imports alphabetically by their full import statement.

```javascript
import express from 'express';
import lodash from 'lodash';
import utils from './utils';
```

## Examples

### Example 1: Sort by line length, then alphabetically (with grouping)

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

### Example 2: Sort by path tree depth, then alphabetically (no grouping)

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

### Example 3: Alphabetical sort with grouping

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

To contribute to this project:

1. See [DEVELOPMENT.md](./DEVELOPMENT.md) for setup instructions
2. See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines
3. See [COMPATIBILITY.md](./COMPATIBILITY.md) for version information

### Quick Start

```bash
# Install Volta (recommended)
curl https://get.volta.sh | bash

# Clone and setup
git clone https://github.com/MrZyr0/eslint-plugin-imports-perfectionist-order.git
cd eslint-plugin-imports-perfectionist-order
yarn install

# Run tests
yarn test

# Run linting
yarn lint
```

## License

MIT
