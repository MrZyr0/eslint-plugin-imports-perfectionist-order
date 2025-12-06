'use strict';

import { RuleTester } from 'eslint';
import { createRequire } from 'module';
import tsParser from '@typescript-eslint/parser';
import rule from '../../../lib/rules/sort.js';

/**
 * Removes leading indentation from test code strings
 * This allows us to write nicely indented test code while
 * ensuring the rule receives properly formatted code
 * @param {string} code - The indented test code
 * @returns {string} - Code with proper indentation removed
 */
function normalizeTestCode(code) {
	// Split into lines and find minimum indentation (excluding empty lines)
	const lines = code.split('\n');
	const nonEmptyLines = lines.filter(line => line.trim().length > 0);

	if (nonEmptyLines.length === 0) return code;

	// Find minimum leading whitespace
	const minIndent = Math.min(
		...nonEmptyLines.map(line => {
			const match = line.match(/^(?<indent>\s*)/);
			return match ? match.groups.indent.length : 0;
		}),
	);

	// Remove minimum indentation from all lines
	return lines
		.map(line => {
			if (line.trim().length === 0) return line; // Preserve empty lines
			return line.slice(minIndent);
		})
		.join('\n')
		.trim();
}

const jsTestCases = {
	valid: [
		// =========================================================================
		// TESTS FOR FILENAME STRATEGY
		// =========================================================================
		{
			name: 'Sort by filename ASC (external first)',
			code: normalizeTestCode(`
				import fs from 'fs';
				import lodash from 'lodash';
				import react from 'react';
				import config from '../config';
				import helper from '../../helper';
				import utils from './utils';
			`),
			options: [{ groups: true, sortStrategies: [{ strategy: 'filename', direction: 'ASC' }] }],
		},
		{
			name: 'Sort by filename DESC (external first)',
			code: normalizeTestCode(`
				import react from 'react';
				import lodash from 'lodash';
				import fs from 'fs';
				import utils from './utils';
				import helper from '../../helper';
				import config from '../config';
			`),
			options: [{ groups: true, sortStrategies: [{ strategy: 'filename', direction: 'DESC' }] }],
		},
		{
			name: 'Sort by filename with different file extensions',
			code: normalizeTestCode(`
				import './styles.css';
				import './styles.scss';
				import './tests.js';
				import './utils';
				import './utils.test';
				import './utils.ts';
			`),
			options: [{ groups: false, sortStrategies: [{ strategy: 'filename', direction: 'ASC' }] }],
		},
		{
			name: 'Sort by filename with scoped packages',
			code: normalizeTestCode(`
				import { ThemeProvider } from '@emotion/react';
				import fs from 'fs';
				import { Button } from '@mui/material';
				import react from 'react';
				import { api } from '@/services/api';
				import { useAuth } from '@/hooks/useAuth';
			`),
			options: [{ groups: true, sortStrategies: [{ strategy: 'filename', direction: 'ASC' }] }],
		},
		{
			name: 'Sort by pathTreeDepth > filename ASC',
			code: normalizeTestCode(`
				import fs from 'fs';
				import react from 'react';
				import deeperHelper from '../../deeper-helper';
				import helper from '../../helper';
				import config from '../config';
				import utils from './utils';
			`),
			options: [
				{
					groups: true,
					sortStrategies: [
						{ strategy: 'pathTreeDepth', direction: 'ASC' },
						{ strategy: 'filename', direction: 'ASC' },
					],
				},
			],
		},
		{
			name: 'Sort by filename with query parameters and hashes',
			code: normalizeTestCode(`
				import './styles.css';
				import './styles.css?module';
				import './styles.scss';
				import './styles.scss#hash';
			`),
			options: [{ groups: false, sortStrategies: [{ strategy: 'filename', direction: 'ASC' }] }],
		},
		// =========================================================================
		// TESTS WITH GROUPS + DIRECTION ASC
		// =========================================================================
		{
			name: 'Sort by line length ASC (external first)',
			code: normalizeTestCode(`
				import fs from 'fs';
				import react from 'react';
				import lodash from 'lodash';
				import utils from './utils';
				import config from '../config';
				import helper from '../../helper';
			`),
			options: [{ groups: true, sortStrategies: [{ strategy: 'lineLength', direction: 'ASC' }] }],
		},
		{
			name: 'Sort by import keyword alphabetically ASC (external first)',
			code: normalizeTestCode(`
				import fs from 'fs';
				import lodash from 'lodash';
				import react from 'react';
				import config from '../config';
				import helper from '../../helper';
				import utils from './utils';
			`),
			options: [{ groups: true, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] }],
		},
		{
			name: 'Sort by path depth ASC (external first)',
			code: normalizeTestCode(`
				import fs from 'fs';
				import react from 'react';
				import lodash from 'lodash';
				import helper from '../../helper';
				import config from '../config';
				import utils from './utils';
			`),
			options: [
				{ groups: true, sortStrategies: [{ strategy: 'pathTreeDepth', direction: 'ASC' }] },
			],
		},
		{
			name: 'Sort by pathTreeDepth > alphabetical ASC (external first)',
			code: normalizeTestCode(`
				import fs from 'fs';
				import lodash from 'lodash';
				import react from 'react';
				import deeper from '../../deeper';
				import helper from '../../helper';
				import config from '../config';
				import utils from './utils';
			`),
			options: [
				{
					groups: true,
					sortStrategies: [
						{ strategy: 'pathTreeDepth', direction: 'ASC' },
						{ strategy: 'alphabetical', direction: 'ASC' },
					],
				},
			],
		},
		{
			name: 'Sort by pathTreeDepth > line length ASC (external first)',
			code: normalizeTestCode(`
				import fs from 'fs';
				import react from 'react';
				import lodash from 'lodash';
				import helper from '../../helper';
				import deeperHelper from '../../deeper-helper';
				import deeperHelper2 from '../../deeper-helper2';
				import config from '../config';
				import utils from './utils';
			`),
			options: [
				{
					groups: true,
					sortStrategies: [
						{ strategy: 'pathTreeDepth', direction: 'ASC' },
						{ strategy: 'lineLength', direction: 'ASC' },
					],
				},
			],
		},
		{
			name: 'Sort by line length > alphabetical ASC (external first)',
			code: normalizeTestCode(`
				import fs from 'fs';
				import react from 'react';
				import lodash from 'lodash';
				import utils from './utils';
				import config from '../config';
				import deeper from '../../deeper';
				import helper from '../../helper';
			`),
			options: [
				{
					groups: true,
					sortStrategies: [
						{ strategy: 'lineLength', direction: 'ASC' },
						{ strategy: 'alphabetical', direction: 'ASC' },
					],
				},
			],
		},
		{
			name: 'Sort by line length > pathTreeDepth ASC (external first)',
			code: normalizeTestCode(`
				import fs from 'fs';
				import react from 'react';
				import lodash from 'lodash';
				import utils from './utils';
				import config from '../config';
				import deeper from '../../deeper';
				import helper from '../helper-lo';
			`),
			options: [
				{
					groups: true,
					sortStrategies: [
						{ strategy: 'lineLength', direction: 'ASC' },
						{ strategy: 'pathTreeDepth', direction: 'ASC' },
					],
				},
			],
		},
		{
			name: 'Sort by alphabetical > line length ASC (external first)',
			code: normalizeTestCode(`
				import fs from 'fs';
				import lodash from 'lodash';
				import lodash2 from 'lodash2';
				import react from 'react';
				import config from '../config';
				import deeper from '../../deeper';
				import helper from '../../helper';
				import helper2 from '../../helper2';
				import utils from './utils';
			`),
			options: [
				{
					groups: true,
					sortStrategies: [
						{ strategy: 'alphabetical', direction: 'ASC' },
						{ strategy: 'lineLength', direction: 'ASC' },
					],
				},
			],
		},
		{
			name: 'Sort by alphabetical > path tree ASC (external first)',
			code: normalizeTestCode(`
				import fs from 'fs';
				import lodash from 'lodash';
				import react from 'react';
				import config from '../config';
				import deeper from '../../deeper';
				import helper from '../../helper';
				import helper2 from '../helper-2';
				import utils from './utils';
			`),
			options: [
				{
					groups: true,
					sortStrategies: [
						{ strategy: 'alphabetical', direction: 'ASC' },
						{ strategy: 'pathTreeDepth', direction: 'ASC' },
					],
				},
			],
		},
		{
			name: 'Sort by pathTreeDepth > line length > alphabetical ASC (external first)',
			code: normalizeTestCode(`
				import fs from 'fs';
				import react from 'react';
				import lodash from 'lodash';
				import helper from '../../helper';
				import helpyr from '../../helpyr';
				import deeperHelper from '../../deeper-helper';
				import deeperHelper2 from '../../deeper-helper2';
				import feeperHelper3 from '../../feeper-helper3';
				import config from '../config';
				import utils from './utils';
			`),
			options: [
				{
					groups: true,
					sortStrategies: [
						{ strategy: 'pathTreeDepth', direction: 'ASC' },
						{ strategy: 'lineLength', direction: 'ASC' },
						{ strategy: 'alphabetical', direction: 'ASC' },
					],
				},
			],
		},
		// =========================================================================
		// TESTS WITH GROUPS - DIRECTION DESC
		// =========================================================================
		{
			name: 'Sort by line length DESC (external first)',
			code: normalizeTestCode(`
				import lodash from 'lodash';
				import react from 'react';
				import fs from 'fs';
				import helper from '../../helper';
				import config from '../config';
				import utils from './utils';
			`),
			options: [{ groups: true, sortStrategies: [{ strategy: 'lineLength', direction: 'DESC' }] }],
		},
		{
			name: 'Sort by alphabetical DESC (external first)',
			code: normalizeTestCode(`
				import react from 'react';
				import lodash from 'lodash';
				import fs from 'fs';
				import utils from './utils';
				import helper from '../../helper';
				import config from '../config';
			`),
			options: [
				{ groups: true, sortStrategies: [{ strategy: 'alphabetical', direction: 'DESC' }] },
			],
		},
		{
			name: 'Sort by pathTreeDepth DESC (external first)',
			code: normalizeTestCode(`
				import fs from 'fs';
				import react from 'react';
				import lodash from 'lodash';
				import utils from './utils';
				import config from '../config';
				import helper from '../../helper';
			`),
			options: [
				{ groups: true, sortStrategies: [{ strategy: 'pathTreeDepth', direction: 'DESC' }] },
			],
		},
		{
			name: 'Sort by pathTreeDepth DESC > alphabetical ASC (external first)',
			code: normalizeTestCode(`
				import fs from 'fs';
				import lodash from 'lodash';
				import react from 'react';
				import utils from './utils';
				import config from '../config';
				import deeper from '../../deeper';
				import helper from '../../helper';
			`),
			options: [
				{
					groups: true,
					sortStrategies: [
						{ strategy: 'pathTreeDepth', direction: 'DESC' },
						{ strategy: 'alphabetical', direction: 'ASC' },
					],
				},
			],
		},
		// =========================================================================
		// TESTS WITHOUT GROUPS - DIRECTION ASC
		// =========================================================================
		{
			name: 'Sort by line length ASC (without groups)',
			code: normalizeTestCode(`
				import fs from 'fs';
				import react from 'react';
				import utils from './utils';
				import config from '../config';
				import helper from '../../helper';
				import lodashLong from 'lodash-long';
			`),
			options: [{ groups: false, sortStrategies: [{ strategy: 'lineLength', direction: 'ASC' }] }],
		},
		{
			name: 'Sort by import keyword alphabetically ASC (without groups)',
			code: normalizeTestCode(`
				import config from '../config';
				import fs from 'fs';
				import helper from '../../helper';
				import lodash from 'lodash';
				import react from 'react';
				import utils from './utils';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		{
			name: 'Sort by path depth ASC (without groups)',
			code: normalizeTestCode(`
				import fs from 'fs';
				import lodash from 'lodash';
				import react from 'react';
				import helper from '../../helper';
				import config from '../config';
				import utils from './utils';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'pathTreeDepth', direction: 'ASC' }] },
			],
		},
		{
			name: 'Sort by pathTreeDepth > alphabetical ASC (without groups)',
			code: normalizeTestCode(`
				import fs from 'fs';
				import lodash from 'lodash';
				import react from 'react';
				import deeper from '../../deeper';
				import helper from '../../helper';
				import config from '../config';
				import utils from './utils';
			`),
			options: [
				{
					groups: false,
					sortStrategies: [
						{ strategy: 'pathTreeDepth', direction: 'ASC' },
						{ strategy: 'alphabetical', direction: 'ASC' },
					],
				},
			],
		},
		{
			name: 'Sort by pathTreeDepth > line length ASC (without groups)',
			code: normalizeTestCode(`
				import fs from 'fs';
				import react from 'react';
				import lodash from 'lodash';
				import helper from '../../helper';
				import deeperHelper from '../../deeper-helper';
				import deeperHelpyr from '../../deeper-helpyr';
				import config from '../config';
				import utils from './utils';
			`),
			options: [
				{
					groups: false,
					sortStrategies: [
						{ strategy: 'pathTreeDepth', direction: 'ASC' },
						{ strategy: 'lineLength', direction: 'ASC' },
					],
				},
			],
		},
		{
			name: 'Sort by line length > alphabetical ASC (without groups)',
			code: normalizeTestCode(`
				import fs from 'fs';
				import react from 'react';
				import lodash from 'lodash';
				import utils from './utils';
				import config from '../config';
				import deeper from '../../deeper';
				import helper from '../../helper';
			`),
			options: [
				{
					groups: false,
					sortStrategies: [
						{ strategy: 'lineLength', direction: 'ASC' },
						{ strategy: 'alphabetical', direction: 'ASC' },
					],
				},
			],
		},
		{
			name: 'Sort by line length > pathTreeDepth ASC (without groups)',
			code: normalizeTestCode(`
				import fs from 'fs';
				import react from 'react';
				import lodash from 'lodash';
				import utils from './utils';
				import config from '../config';
				import deeper from '../../deeper';
				import helper from '../../helper';
			`),
			options: [
				{
					groups: false,
					sortStrategies: [
						{ strategy: 'lineLength', direction: 'ASC' },
						{ strategy: 'pathTreeDepth', direction: 'ASC' },
					],
				},
			],
		},
		{
			name: 'Sort by alphabetical > line length ASC (without groups)',
			code: normalizeTestCode(`
				import config from '../config';
				import deeper from '../../deeper';
				import fs from 'fs';
				import helper from '../../helper';
				import helper2 from '../../helper2';
				import lodash from 'lodash';
				import react from 'react';
				import utils from './utils';
			`),
			options: [
				{
					groups: false,
					sortStrategies: [
						{ strategy: 'alphabetical', direction: 'ASC' },
						{ strategy: 'lineLength', direction: 'ASC' },
					],
				},
			],
		},
		{
			name: 'Sort by alphabetical > path tree ASC (without groups)',
			code: normalizeTestCode(`
				import config from '../config';
				import deeper from '../../deeper';
				import fs from 'fs';
				import helper from '../../helper';
				import helper2 from '../helper-2';
				import lodash from 'lodash';
				import react from 'react';
				import utils from './utils';
			`),
			options: [
				{
					groups: false,
					sortStrategies: [
						{ strategy: 'alphabetical', direction: 'ASC' },
						{ strategy: 'pathTreeDepth', direction: 'ASC' },
					],
				},
			],
		},
		{
			name: 'Sort by pathTreeDepth > line length > alphabetical ASC (without groups)',
			code: normalizeTestCode(`
				import fs from 'fs';
				import react from 'react';
				import lodash from 'lodash';
				import helper from '../../helper';
				import helpyr from '../../helpyr';
				import deeperHelper from '../../deeper-helper';
				import deeperHelper2 from '../../deeper-helper2';
				import feeperHelper3 from '../../feeper-helper3';
				import config from '../config';
				import utils from './utils';
			`),
			options: [
				{
					groups: false,
					sortStrategies: [
						{ strategy: 'pathTreeDepth', direction: 'ASC' },
						{ strategy: 'lineLength', direction: 'ASC' },
						{ strategy: 'alphabetical', direction: 'ASC' },
					],
				},
			],
		},
		// =========================================================================
		// TESTS WITHOUT GROUPS - DIRECTION DESC
		// =========================================================================
		{
			name: 'Sort by line length DESC (without groups)',
			code: normalizeTestCode(`
				import lodashLong from 'lodash-long';
				import helper from '../../helper';
				import config from '../config';
				import utils from './utils';
				import react from 'react';
				import fs from 'fs';
			`),
			options: [{ groups: false, sortStrategies: [{ strategy: 'lineLength', direction: 'DESC' }] }],
		},
		{
			name: 'Sort by alphabetical DESC (without groups)',
			code: normalizeTestCode(`
				import utils from './utils';
				import react from 'react';
				import lodash from 'lodash';
				import helper from '../../helper';
				import fs from 'fs';
				import config from '../config';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'DESC' }] },
			],
		},
		{
			name: 'Sort by pathTreeDepth DESC (without groups)',
			code: normalizeTestCode(`
				import utils from './utils';
				import config from '../config';
				import helper from '../../helper';
				import fs from 'fs';
				import lodash from 'lodash';
				import react from 'react';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'pathTreeDepth', direction: 'DESC' }] },
			],
		},
		// =========================================================================
		// SPECIAL CASES
		// =========================================================================
		{
			name: 'Scoped packages (@scope/package)',
			code: normalizeTestCode(`
				import { api } from '@myorg/api';
				import { Button } from '@myorg/ui';
				import React from 'react';
				import utils from './utils';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		{
			name: 'Side effect imports (no specifiers)',
			code: normalizeTestCode(`
				import App from './App';
				import 'polyfill';
				import React from 'react';
				import './styles.css';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		{
			name: 'Imports with aliases',
			code: normalizeTestCode(`
				import { helper as h } from './utils';
				import React from 'react';
				import { useState as useStateAlias } from 'react';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		{
			name: 'Multiple specifiers',
			code: normalizeTestCode(`
				import { a, b, c } from 'module';
				import { bar, foo } from './local';
				import { x } from 'module2';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		{
			name: 'Custom internal pattern (src/)',
			code: normalizeTestCode(`
				import React from 'react';
				import config from 'src/config';
				import utils from 'src/utils';
			`),
			options: [
				{
					groups: true,
					internalPattern: '^src/',
					sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }],
				},
			],
		},
		{
			name: 'Multiple import groups separated by code',
			code: normalizeTestCode(`
				import a from 'a';
				import b from 'b';

				const x = 1;

				import c from 'c';
				import d from 'd';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		{
			name: 'Imports with file extensions',
			code: normalizeTestCode(`
				import Component from './Component.jsx';
				import utils from './utils.js';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		{
			name: 'Default and named imports',
			code: normalizeTestCode(`
				import lodash from 'lodash';
				import React, { useState } from 'react';
				import App from './App';
			`),
			options: [{ groups: true, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] }],
		},
		{
			name: 'Namespace imports',
			code: normalizeTestCode(`
				import * as React from 'react';
				import * as utils from './utils';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		// =========================================================================
		// BORDERLINE CASES
		// =========================================================================
		{
			name: 'Empty file',
			code: '',
			options: [{ groups: true, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] }],
		},
		{
			name: 'Single import',
			code: 'import React from "react";',
			options: [{ groups: true, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] }],
		},
		{
			name: 'Already sorted imports',
			code: normalizeTestCode(`
				import a from 'a';
				import b from 'b';
				import c from 'c';
				import x from './x';
				import y from './y';
			`),
			options: [{ groups: true, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] }],
		},
		{
			name: 'Imports with comments',
			code: normalizeTestCode(`
				// External dependencies
				import lodash from 'lodash';
				import React from 'react';
				// Internal utilities
				import utils from './utils';
			`),
			options: [{ groups: true, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] }],
		},
		{
			name: 'Module aliases (@/ and ~/)',
			code: normalizeTestCode(`
				import React from 'react';
				import api from '@/services/api';
				import Button from '~/components/Button';
				import utils from '@/utils';
			`),
			options: [
				{
					groups: true,
					internalPattern: '^(@/|~/)',
					sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }],
				},
			],
		},
		{
			name: 'Export re-exports',
			code: normalizeTestCode(`
				export * from './utils';
				export { default as Button } from './Button';
				export { Input } from './Input';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		{
			name: 'Deep relative paths (3+ levels)',
			code: normalizeTestCode(`
				import React from 'react';
				import config from '../../../../config';
				import helper from '../../../helper';
				import utils from './utils';
			`),
			options: [
				{ groups: true, sortStrategies: [{ strategy: 'pathTreeDepth', direction: 'ASC' }] },
			],
		},
		{
			name: 'lineLength DESC > alphabetical ASC',
			code: normalizeTestCode(`
				import verylongname from 'verylongname';
				import longname from 'longname';
				import short from 'short';
				import a from 'a';
				import b from 'b';
			`),
			options: [
				{
					groups: false,
					sortStrategies: [
						{ strategy: 'lineLength', direction: 'DESC' },
						{ strategy: 'alphabetical', direction: 'ASC' },
					],
				},
			],
		},
		{
			name: 'Invalid regex pattern (fallback to default)',
			code: normalizeTestCode(`
				import React from 'react';
				import utils from './utils';
			`),
			options: [
				{
					groups: true,
					internalPattern: '[invalid(regex', // Invalid regex
					sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }],
				},
			],
		},
		{
			name: 'Complex internal pattern',
			code: normalizeTestCode(`
				import React from 'react';
				import api from '@/api';
				import config from 'src/config';
				import utils from '~/utils';
			`),
			options: [
				{
					groups: true,
					internalPattern: '^(@/|~/|src/)',
					sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }],
				},
			],
		},
		{
			name: 'Default configuration (no options)',
			code: normalizeTestCode(`
				import fs from 'fs';
				import react from 'react';
				import utils from './utils';
			`),
			options: [], // Devrait utiliser DEFAULT_CONFIG
		},
		{
			name: 'Node.js built-in imports with node: prefix',
			code: normalizeTestCode(`
				import fs from 'node:fs';
				import path from 'node:path';
				import React from 'react';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		{
			name: 'Same length imports (fallback to secondary strategy)',
			code: normalizeTestCode(`
				import aaa from 'aaa';
				import bbb from 'bbb';
				import zzz from 'zzz';
			`),
			options: [
				{
					groups: false,
					sortStrategies: [
						{ strategy: 'lineLength', direction: 'ASC' },
						{ strategy: 'alphabetical', direction: 'ASC' },
					],
				},
			],
		},
		{
			name: 'Strategy as string (normalized)',
			code: normalizeTestCode(`
				import fs from 'fs';
				import react from 'react';
			`),
			options: [
				{
					groups: false,
					sortStrategies: ['lineLength', 'alphabetical'], // Strings instead of objects
				},
			],
		},
		{
			name: 'Empty strategy',
			code: normalizeTestCode(`
				import react from 'react';
				import fs from 'fs';
			`),
			options: [{ groups: false, sortStrategies: [] }],
		},
		// =========================================================================
		// TESTS FOR DESTRUCTURED IMPORTS
		// =========================================================================
		{
			name: 'Sort destructured imports on single line',
			code: normalizeTestCode(`
				import { alpha, beta, gamma } from 'greek';
				import { a, b, c } from 'alphabet';
				import { x, y, z } from 'xyz';
			`),
			options: [{ groups: false, sortStrategies: [], sortDestructuredImports: true }],
		},
		{
			name: 'Sort destructured imports on multiple lines',
			code: normalizeTestCode(`
				import {
					a,
					b,
					c
				} from 'alphabet';
				import {
					alpha,
					beta,
					gamma
				} from 'greek';
			`),
			options: [
				{
					groups: false,
					sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }],
					sortDestructuredImports: true,
				},
			],
		},
		{
			name: 'Sort mixed default and destructured imports',
			code: normalizeTestCode(`
				import { Alert, Button, Card } from 'react-bootstrap';
				import React, { useEffect, useMemo, useState } from 'react';
				import { fetchData, processData, saveData } from './api';
			`),
			options: [{ groups: false, sortStrategies: [], sortDestructuredImports: true }],
		},
		{
			name: 'Sort destructured imports with aliases',
			code: normalizeTestCode(`
				import { a as alpha, b as beta, c as gamma, d as foo } from 'alphabet';
				import { Component as Comp, Fragment, memo } from 'react';
			`),
			options: [{ groups: false, sortStrategies: [], sortDestructuredImports: true }],
		},
		// =========================================================================
		// DEFAULT CONFIG
		// =========================================================================
		{
			name: 'Sort by pathTreeDepth > filename > alphabetical > line length  ASC (with groups, default config)',
			code: normalizeTestCode(`
				// External dependencies (node modules)
				import fs from 'fs';
				import * as lodash from 'lodash';
				import { filter, map, reduce } from 'lodash';
				import { Button as MuiButton } from '@mui/material';
				import path from 'path';
				import React from 'react';
				import { useEffect, useMemo, useState } from 'react';
				import type { FC, PropsWithChildren } from 'react';

				// Internal relative imports (ascending depth)
				import { fetchData } from '../../utils/api';
				import { formatDate } from '../../utils/date';
				import { useAuth } from '../../hooks/useAuth';
				import { Footer, Header } from '../components';
				import { User } from '../types';
				import { logger } from './utils/logger';

				// Internal same-level imports
				import { config } from './config';
				import { CONSTANTS } from './constants';
				import { processData } from './data';
				import { helper } from './utils/helper';
				import type { UserType } from './types';

				// Side effect imports
				import 'tailwindcss/tailwind.css';
				import './styles.css';
			`),
			languageOptions: {
				parser: tsParser,
				parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
			},
		},
	],

	invalid: [
		// =========================================================================
		// DESTRUCTURED IMPORTS ERRORS
		// =========================================================================
		{
			name: 'Imports with trailing commas',
			code: normalizeTestCode(`
				import { a, b, } from 'module';
				import React from 'react';
			`),
			errors: [
				{
					message:
						"Import specifiers should be sorted alphabetically. 'undefined' should come before ''.",
				},
			],
			output: normalizeTestCode(`
				import { a, b } from 'module';
				import React from 'react';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		{
			name: 'Error on unsorted destructured imports (single line)',
			code: normalizeTestCode(`
				import { c, a, b } from 'alphabet';
			`),
			errors: [
				{
					message: "Import specifiers should be sorted alphabetically. 'a' should come before 'c'.",
				},
			],
			output: normalizeTestCode(`
				import { a, b, c } from 'alphabet';
			`),
			options: [{ groups: false, sortStrategies: [], sortDestructuredImports: true }],
		},
		{
			name: 'Error on unsorted destructured imports (multi-line)',
			code: normalizeTestCode(`
				import {
					c,
					a,
					b
				} from 'alphabet';
			`),
			errors: [
				{
					message: "Import specifiers should be sorted alphabetically. 'a' should come before 'c'.",
				},
			],
			output: normalizeTestCode(`
				import {
					a,
					b,
					c
				} from 'alphabet';
			`),
			options: [{ groups: false, sortStrategies: [], sortDestructuredImports: true }],
		},
		{
			name: 'Error on unsorted destructured imports with aliases',
			code: normalizeTestCode(`
				import { c as gamma, a as alpha, b as beta } from 'alphabet';
			`),
			errors: [
				{
					message:
						"Import specifiers should be sorted alphabetically. 'a as alpha' should come before 'c as gamma'.",
				},
			],
			output: normalizeTestCode(`
				import { a as alpha, b as beta, c as gamma } from 'alphabet';
			`),
			options: [{ groups: false, sortStrategies: [], sortDestructuredImports: true }],
		},
		{
			name: 'Error on mixed default and destructured imports',
			code: normalizeTestCode(`
				import React, { useEffect, useState, useMemo } from 'react';
			`),
			errors: [
				{
					message:
						"Import specifiers should be sorted alphabetically. 'useMemo' should come before 'useState'.",
				},
			],
			output: normalizeTestCode(`
				import React, { useEffect, useMemo, useState } from 'react';
			`),
			options: [{ groups: false, sortStrategies: [], sortDestructuredImports: true }],
		},

		// =========================================================================
		// SORTING ERRORS - SINGLE STRATEGY
		// =========================================================================
		{
			name: 'Wrong order - lineLength ASC',
			code: normalizeTestCode(`
				import lodash from 'lodash';
				import fs from 'fs';
			`),
			output: normalizeTestCode(`
				import fs from 'fs';
				import lodash from 'lodash';
			`),
			options: [{ groups: false, sortStrategies: [{ strategy: 'lineLength', direction: 'ASC' }] }],
			errors: [{ messageId: 'orderRequired' }],
		},
		{
			name: 'Wrong order - lineLength DESC',
			code: normalizeTestCode(`
				import fs from 'fs';
				import lodash from 'lodash';
			`),
			output: normalizeTestCode(`
				import lodash from 'lodash';
				import fs from 'fs';
			`),
			options: [{ groups: false, sortStrategies: [{ strategy: 'lineLength', direction: 'DESC' }] }],
			errors: [{ messageId: 'orderRequired' }],
		},
		{
			name: 'Wrong order - alphabetical ASC',
			code: normalizeTestCode(`
				import z from 'z';
				import a from 'a';
			`),
			output: normalizeTestCode(`
				import a from 'a';
				import z from 'z';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
			errors: [{ messageId: 'orderRequired' }],
		},
		{
			name: 'Wrong order - alphabetical DESC',
			code: normalizeTestCode(`
				import a from 'a';
				import z from 'z';
			`),
			output: normalizeTestCode(`
				import z from 'z';
				import a from 'a';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'DESC' }] },
			],
			errors: [{ messageId: 'orderRequired' }],
		},
		{
			name: 'Wrong order - pathTreeDepth ASC',
			code: normalizeTestCode(`
				import utils from './utils';
				import helper from '../../helper';
			`),
			output: normalizeTestCode(`
				import helper from '../../helper';
				import utils from './utils';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'pathTreeDepth', direction: 'ASC' }] },
			],
			errors: [{ messageId: 'orderRequired' }],
		},
		{
			name: 'Wrong order - pathTreeDepth DESC',
			code: normalizeTestCode(`
				import helper from '../../helper';
				import utils from './utils';
			`),
			output: normalizeTestCode(`
				import utils from './utils';
				import helper from '../../helper';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'pathTreeDepth', direction: 'DESC' }] },
			],
			errors: [{ messageId: 'orderRequired' }],
		},
		// =========================================================================
		// GROUPING ERRORS
		// =========================================================================
		{
			name: 'Wrong grouping - internal before external',
			code: normalizeTestCode(`
				import utils from './utils';
				import React from 'react';
			`),
			output: normalizeTestCode(`
				import React from 'react';
				import utils from './utils';
			`),
			options: [{ groups: true, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] }],
			errors: [{ messageId: 'groupingRequired' }],
		},
		{
			name: 'Wrong grouping - mixed external and internal',
			code: normalizeTestCode(`
				import React from 'react';
				import utils from './utils';
				import lodash from 'lodash';
			`),
			output: normalizeTestCode(`
				import lodash from 'lodash';
				import React from 'react';
				import utils from './utils';
			`),
			options: [{ groups: true, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] }],
			errors: [{ messageId: 'groupingRequired' }],
		},
		// =========================================================================
		// MULTIPLE ERRORS (SORTING + GROUPING)
		// =========================================================================
		{
			name: 'Wrong order and wrong grouping',
			code: normalizeTestCode(`
				import z from 'z';
				import a from 'a';
				import internal2 from './internal2';
				import internal1 from './internal1';
			`),
			output: normalizeTestCode(`
				import a from 'a';
				import z from 'z';
				import internal1 from './internal1';
				import internal2 from './internal2';
			`),
			options: [{ groups: true, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] }],
			errors: [{ messageId: 'orderRequired' }],
		},
		{
			name: 'Complex wrong order - multiple strategies',
			code: normalizeTestCode(`
				import verylongname from 'verylongname';
				import a from 'a';
				import z from './z';
				import b from './b';
			`),
			output: normalizeTestCode(`
				import a from 'a';
				import verylongname from 'verylongname';
				import b from './b';
				import z from './z';
			`),
			options: [
				{
					groups: true,
					sortStrategies: [
						{ strategy: 'lineLength', direction: 'ASC' },
						{ strategy: 'alphabetical', direction: 'ASC' },
					],
				},
			],
			errors: [{ messageId: 'orderRequired' }],
		},
		// =========================================================================
		// ERRORS WITH SPECIAL CASES
		// =========================================================================
		{
			name: 'Wrong order - scoped packages',
			code: normalizeTestCode(`
				import { Button } from '@myorg/button';
				import { api } from '@myorg/api';
			`),
			output: normalizeTestCode(`
				import { api } from '@myorg/api';
				import { Button } from '@myorg/button';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
			errors: [{ messageId: 'orderRequired' }],
		},
		{
			name: 'Wrong order - side effects',
			code: normalizeTestCode(`
				import React from 'react';
				import 'polyfill';
			`),
			output: normalizeTestCode(`
				import 'polyfill';
				import React from 'react';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
			errors: [{ messageId: 'orderRequired' }],
		},
		{
			name: 'Wrong order with custom pattern',
			code: normalizeTestCode(`
				import utils from 'src/utils';
				import React from 'react';
			`),
			output: normalizeTestCode(`
				import React from 'react';
				import utils from 'src/utils';
			`),
			options: [
				{
					groups: true,
					internalPattern: '^src/',
					sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }],
				},
			],
			errors: [{ messageId: 'groupingRequired' }],
		},
	],
};

const tsTestCases = {
	valid: [
		{
			name: 'TypeScript type imports',
			code: normalizeTestCode(`
				import type { Config } from './config';
				import { getData } from './api';
				import React from 'react';
				import type { User } from './types';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
			languageOptions: {
				parser: tsParser,
				parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
			},
		},
		{
			name: 'TypeScript type imports with aliases',
			code: normalizeTestCode(`
				import React from 'react';
				import { getData, getOther } from './api';
				import type { AlphaUser as AlphaUserType, User as UserType } from './types';
				import type { Config as AppConfigType, Data as DataType } from './config';
			`),
			options: [{ groups: false, sortStrategies: [], sortDestructuredImports: true }],
			languageOptions: {
				parser: tsParser,
				parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
			},
		},
		{
			name: 'TypeScript type imports with mixed imports',
			code: normalizeTestCode(`
				import React, { type FC, useEffect, useState } from 'react';
				import { Button, type ButtonProps, Config } from './components/Button';
			`),
			options: [{ groups: false, sortStrategies: [], sortDestructuredImports: true }],
			languageOptions: {
				parser: tsParser,
				parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
			},
		},
		{
			name: 'Mixed import types (ungrouped)',
			code: normalizeTestCode(`
				import type { Config } from './types';
				import 'polyfill';
				import React, { useState } from 'react';
				import * as Utils from './utils';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		{
			name: 'Mixed import types (grouped)',
			code: normalizeTestCode(`
				import 'polyfill';
				import React, { useState } from 'react';
				import type { Config } from './types';
				import * as Utils from './utils';
			`),
			options: [{ groups: true, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] }],
		},
	],
	invalid: [
		// =========================================================================
		// TYPESCRIPT TYPE IMPORTS ERRORS
		// =========================================================================
		{
			name: 'TypeScript unsorted type imports',
			code: normalizeTestCode(`
				import type { User, Config } from './types';
			`),
			errors: [
				{
					message:
						"Import specifiers should be sorted alphabetically. 'Config' should come before 'User'.",
				},
			],
			output: normalizeTestCode(`
				import type { Config, User } from './types';
			`),
			options: [{ groups: false, sortStrategies: [], sortDestructuredImports: true }],
			languageOptions: {
				parser: tsParser,
				parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
			},
		},
		{
			name: 'TypeScript unsorted type imports with mixed imports',
			code: normalizeTestCode(`
				import { useState, type FC, useEffect } from 'react';
			`),
			errors: [
				{
					message:
						"Import specifiers should be sorted alphabetically. 'FC' should come before 'useState'.",
				},
			],
			output: normalizeTestCode(`
				import { type FC, useEffect, useState } from 'react';
			`),
			options: [{ groups: false, sortStrategies: [], sortDestructuredImports: true }],
			languageOptions: {
				parser: tsParser,
				parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
			},
		},
		{
			name: 'TypeScript unsorted type imports with aliases',
			code: normalizeTestCode(`
				import { type User as UserType, type Config as AppConfig } from './types';
			`),
			errors: [
				{
					message:
						"Import specifiers should be sorted alphabetically. 'Config as AppConfig' should come before 'User as UserType'.",
				},
			],
			output: normalizeTestCode(`
				import { type Config as AppConfig, type User as UserType } from './types';
			`),
			options: [
				{
					groups: false,
					sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }],
					sortDestructuredImports: true,
				},
			],
			languageOptions: {
				parser: tsParser,
				parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
			},
		},

		// =========================================================================
		// EXISTING TESTS
		// =========================================================================
		{
			name: 'TypeScript wrong order',
			code: normalizeTestCode(`
				import type { User } from './types';
				import { getData } from './api';
				import React from 'react';
				import type { Config } from './config';
			`),
			output: normalizeTestCode(`
				import type { Config } from './config';
				import { getData } from './api';
				import React from 'react';
				import type { User } from './types';
			`),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
			languageOptions: {
				parser: tsParser,
				parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
			},
			errors: [{ messageId: 'orderRequired' }],
		},
	],
};

// ---------------------------------------------------------------------------
// Version detection
// ---------------------------------------------------------------------------
const require = createRequire(import.meta.url);
const eslintPkg = require('eslint/package.json');
const eslintMajor = parseInt(eslintPkg.version.split('.')[0], 10);
const IS_ESLINT9_PLUS = eslintMajor >= 9;

// For ESLint 8, it's safer to use the parser path
const tsParserPath = require.resolve('@typescript-eslint/parser');

// ---------------------------------------------------------------------------
// RuleTester base configs
// ---------------------------------------------------------------------------
// ESLint >= 9: "flat" config using languageOptions
const baseConfigFlat = { languageOptions: { ecmaVersion: 2022, sourceType: 'module' } };

const tsConfigFlat = {
	languageOptions: { parser: tsParser, parserOptions: { ecmaVersion: 2022, sourceType: 'module' } },
};

// ESLint 8: legacy config using parserOptions (with parser for TS)
const legacyBaseConfig = {
	parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
};

const legacyTsConfig = {
	parser: tsParserPath,
	parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
};

// Instantiate RuleTesters
const jsRuleTester = new RuleTester(IS_ESLINT9_PLUS ? baseConfigFlat : legacyBaseConfig);
const tsRuleTester = new RuleTester(IS_ESLINT9_PLUS ? tsConfigFlat : legacyTsConfig);

// ---------------------------------------------------------------------------
// Compatibility adapter (ESLint 9 → ESLint 8)
// ---------------------------------------------------------------------------
/**
 * Converts test cases from ESLint 9+ format (languageOptions)
 * to ESLint 8 format (parser / parserOptions). Also removes `nametrim(),
 * - If isTypeScriptTest = true, enforces TS parser for ESLint 8.
 */
/**
 * Adjust test cases for compatibility between ESLint 8 and 9
 *
 * This function converts test cases from ESLint 9+ format (using languageOptions)
 * to ESLint 8 format (using parser and parserOptions directly).
 * @param {object} testCases - The test cases to adjust
 * @param {boolean} isFlatFormat - Whether ESLint 9+ is being used
 * @param {boolean} isTypeScriptTest - Whether the test case is for TypeScript
 * @returns {object} Adjusted test cases
 */
function adaptTestCasesForCompatibility(testCases, isFlatFormat, isTypeScriptTest = false) {
	if (isFlatFormat) return testCases; // ESLint 9+: pas de conversion [file:54]

	// eslint-disable-next-line func-style -- needed to use adaptTestCasesForCompatibility params
	const convertOne = test => {
		delete test.name;
		const { languageOptions, ...rest } = test; // `name` not supported in ESLint 8 [file:54]
		const out = { ...rest };

		// Get ecmaVersion/sourceType from languageOptions if they exist
		const lo = languageOptions || {};
		const loParser = lo.parser;
		const loParserOptions = lo.parserOptions || {};
		const loEcmaVersion = lo.ecmaVersion;
		const loSourceType = lo.sourceType;

		// Prepare parserOptions
		const parserOptions = {
			// Priority: explicit values already present on the test (if the author provided them)
			...(out.parserOptions || {}),
			// Then those from languageOptions (ESLint 9)
			...(loParserOptions || {}),
		};

		if (loEcmaVersion && !parserOptions.ecmaVersion) parserOptions.ecmaVersion = loEcmaVersion;
		if (loSourceType && !parserOptions.sourceType) parserOptions.sourceType = loSourceType;

		// Determine parser for ESLint 8
		if (isTypeScriptTest) {
			// Force TS parser for all TS tests on ESLint 8
			out.parser = tsParserPath;
		} else if (loParser) {
			// If a parser was defined in languageOptions (rare in pure JS), carry it over
			// On ESLint 8 side, use resolved path if possible
			out.parser = typeof loParser === 'string' ? loParser : tsParserPath;
		}

		if (Object.keys(parserOptions).length > 0) {
			out.parserOptions = parserOptions;
		}

		return out;
	};

	return {
		valid: (testCases.valid || []).map(convertOne),
		invalid: (testCases.invalid || []).map(convertOne),
	};
}

// ---------------------------------------------------------------------------
// Run RuleTesters
// ---------------------------------------------------------------------------
jsRuleTester.run('sort', rule, adaptTestCasesForCompatibility(jsTestCases, IS_ESLINT9_PLUS, false));

tsRuleTester.run('sort', rule, adaptTestCasesForCompatibility(tsTestCases, IS_ESLINT9_PLUS, true));
