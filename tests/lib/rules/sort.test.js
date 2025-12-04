'use strict';

import { RuleTester } from 'eslint';
import { createRequire } from 'module';
import tsParser from '@typescript-eslint/parser';
import rule from '../../../lib/rules/sort.js';

const jsTestCases = {
	valid: [
		// =========================================================================
		// TESTS WITH GROUPS + DIRECTION ASC
		// =========================================================================
		{
			name: 'Sort by line length ASC (external first)',
			code: `
import fs from 'fs';
import react from 'react';
import lodash from 'lodash';
import utils from './utils';
import config from '../config';
import helper from '../../helper';
      `.trim(),
			options: [{ groups: true, sortStrategies: [{ strategy: 'lineLength', direction: 'ASC' }] }],
		},
		{
			name: 'Sort by import keyword alphabetically ASC (external first)',
			code: `
import fs from 'fs';
import lodash from 'lodash';
import react from 'react';
import config from '../config';
import helper from '../../helper';
import utils from './utils';
      `.trim(),
			options: [{ groups: true, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] }],
		},
		{
			name: 'Sort by path depth ASC (external first)',
			code: `
import fs from 'fs';
import react from 'react';
import lodash from 'lodash';
import helper from '../../helper';
import config from '../config';
import utils from './utils';
      `.trim(),
			options: [
				{ groups: true, sortStrategies: [{ strategy: 'pathTreeDepth', direction: 'ASC' }] },
			],
		},
		{
			name: 'Sort by pathTreeDepth > alphabetical ASC (external first)',
			code: `
import fs from 'fs';
import lodash from 'lodash';
import react from 'react';
import deeper from '../../deeper';
import helper from '../../helper';
import config from '../config';
import utils from './utils';
      `.trim(),
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
			code: `
import fs from 'fs';
import react from 'react';
import lodash from 'lodash';
import helper from '../../helper';
import deeperHelper from '../../deeper-helper';
import deeperHelper2 from '../../deeper-helper2';
import config from '../config';
import utils from './utils';
      `.trim(),
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
			code: `
import fs from 'fs';
import react from 'react';
import lodash from 'lodash';
import utils from './utils';
import config from '../config';
import deeper from '../../deeper';
import helper from '../../helper';
      `.trim(),
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
			code: `
import fs from 'fs';
import react from 'react';
import lodash from 'lodash';
import utils from './utils';
import config from '../config';
import deeper from '../../deeper';
import helper from '../helper-lo';
      `.trim(),
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
			code: `
import fs from 'fs';
import lodash from 'lodash';
import lodash2 from 'lodash2';
import react from 'react';
import config from '../config';
import deeper from '../../deeper';
import helper from '../../helper';
import helper2 from '../../helper2';
import utils from './utils';
      `.trim(),
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
			code: `
import fs from 'fs';
import lodash from 'lodash';
import react from 'react';
import config from '../config';
import deeper from '../../deeper';
import helper from '../../helper';
import helper2 from '../helper-2';
import utils from './utils';
      `.trim(),
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
			code: `
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
      `.trim(),
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
			code: `
import lodash from 'lodash';
import react from 'react';
import fs from 'fs';
import helper from '../../helper';
import config from '../config';
import utils from './utils';
      `.trim(),
			options: [{ groups: true, sortStrategies: [{ strategy: 'lineLength', direction: 'DESC' }] }],
		},
		{
			name: 'Sort by alphabetical DESC (external first)',
			code: `
import react from 'react';
import lodash from 'lodash';
import fs from 'fs';
import utils from './utils';
import helper from '../../helper';
import config from '../config';
      `.trim(),
			options: [
				{ groups: true, sortStrategies: [{ strategy: 'alphabetical', direction: 'DESC' }] },
			],
		},
		{
			name: 'Sort by pathTreeDepth DESC (external first)',
			code: `
import fs from 'fs';
import react from 'react';
import lodash from 'lodash';
import utils from './utils';
import config from '../config';
import helper from '../../helper';
      `.trim(),
			options: [
				{ groups: true, sortStrategies: [{ strategy: 'pathTreeDepth', direction: 'DESC' }] },
			],
		},
		{
			name: 'Sort by pathTreeDepth DESC > alphabetical ASC (external first)',
			code: `
import fs from 'fs';
import lodash from 'lodash';
import react from 'react';
import utils from './utils';
import config from '../config';
import deeper from '../../deeper';
import helper from '../../helper';
      `.trim(),
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
			code: `
import fs from 'fs';
import react from 'react';
import utils from './utils';
import config from '../config';
import helper from '../../helper';
import lodashLong from 'lodash-long';
      `.trim(),
			options: [{ groups: false, sortStrategies: [{ strategy: 'lineLength', direction: 'ASC' }] }],
		},
		{
			name: 'Sort by import keyword alphabetically ASC (without groups)',
			code: `
import config from '../config';
import fs from 'fs';
import helper from '../../helper';
import lodash from 'lodash';
import react from 'react';
import utils from './utils';
      `.trim(),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		{
			name: 'Sort by path depth ASC (without groups)',
			code: `
import fs from 'fs';
import lodash from 'lodash';
import react from 'react';
import helper from '../../helper';
import config from '../config';
import utils from './utils';
      `.trim(),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'pathTreeDepth', direction: 'ASC' }] },
			],
		},
		{
			name: 'Sort by pathTreeDepth > alphabetical ASC (without groups)',
			code: `
import fs from 'fs';
import lodash from 'lodash';
import react from 'react';
import deeper from '../../deeper';
import helper from '../../helper';
import config from '../config';
import utils from './utils';
      `.trim(),
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
			code: `
import fs from 'fs';
import react from 'react';
import lodash from 'lodash';
import helper from '../../helper';
import deeperHelper from '../../deeper-helper';
import deeperHelpyr from '../../deeper-helpyr';
import config from '../config';
import utils from './utils';
      `.trim(),
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
			code: `
import fs from 'fs';
import react from 'react';
import lodash from 'lodash';
import utils from './utils';
import config from '../config';
import deeper from '../../deeper';
import helper from '../../helper';
      `.trim(),
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
			code: `
import fs from 'fs';
import react from 'react';
import lodash from 'lodash';
import utils from './utils';
import config from '../config';
import deeper from '../../deeper';
import helper from '../../helper';
      `.trim(),
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
			code: `
import config from '../config';
import deeper from '../../deeper';
import fs from 'fs';
import helper from '../../helper';
import helper2 from '../../helper2';
import lodash from 'lodash';
import react from 'react';
import utils from './utils';
      `.trim(),
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
			code: `
import config from '../config';
import deeper from '../../deeper';
import fs from 'fs';
import helper from '../../helper';
import helper2 from '../helper-2';
import lodash from 'lodash';
import react from 'react';
import utils from './utils';
      `.trim(),
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
			code: `
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
      `.trim(),
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
			code: `
import lodashLong from 'lodash-long';
import helper from '../../helper';
import config from '../config';
import utils from './utils';
import react from 'react';
import fs from 'fs';
      `.trim(),
			options: [{ groups: false, sortStrategies: [{ strategy: 'lineLength', direction: 'DESC' }] }],
		},
		{
			name: 'Sort by alphabetical DESC (without groups)',
			code: `
import utils from './utils';
import react from 'react';
import lodash from 'lodash';
import helper from '../../helper';
import fs from 'fs';
import config from '../config';
      `.trim(),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'DESC' }] },
			],
		},
		{
			name: 'Sort by pathTreeDepth DESC (without groups)',
			code: `
import utils from './utils';
import config from '../config';
import helper from '../../helper';
import fs from 'fs';
import lodash from 'lodash';
import react from 'react';
      `.trim(),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'pathTreeDepth', direction: 'DESC' }] },
			],
		},
		// =========================================================================
		// SPECIAL CASES
		// =========================================================================
		{
			name: 'Scoped packages (@scope/package)',
			code: `
import { api } from '@myorg/api';
import { Button } from '@myorg/ui';
import React from 'react';
import utils from './utils';
      `.trim(),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		{
			name: 'Side effect imports (no specifiers)',
			code: `
import App from './App';
import 'polyfill';
import React from 'react';
import './styles.css';
      `.trim(),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		{
			name: 'Imports with aliases',
			code: `
import { helper as h } from './utils';
import React from 'react';
import { useState as useStateAlias } from 'react';
      `.trim(),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		{
			name: 'Multiple specifiers',
			code: `
import { a, b, c } from 'module';
import { foo, bar } from './local';
import { x } from 'module2';
      `.trim(),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		{
			name: 'Custom internal pattern (src/)',
			code: `
import React from 'react';
import config from 'src/config';
import utils from 'src/utils';
      `.trim(),
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
			code: `
import a from 'a';
import b from 'b';

const x = 1;

import c from 'c';
import d from 'd';
      `.trim(),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		{
			name: 'Imports with file extensions',
			code: `
import Component from './Component.jsx';
import utils from './utils.js';
      `.trim(),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		{
			name: 'Default and named imports',
			code: `
import lodash from 'lodash';
import React, { useState } from 'react';
import App from './App';
      `.trim(),
			options: [{ groups: true, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] }],
		},
		{
			name: 'Namespace imports',
			code: `
import * as React from 'react';
import * as utils from './utils';
      `.trim(),
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
			code: `
import a from 'a';
import b from 'b';
import c from 'c';
import x from './x';
import y from './y';
      `.trim(),
			options: [{ groups: true, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] }],
		},
		{
			name: 'Imports with comments',
			code: `
// External dependencies
import lodash from 'lodash';
import React from 'react';
// Internal utilities
import utils from './utils';
      `.trim(),
			options: [{ groups: true, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] }],
		},
		{
			name: 'Imports with trailing commas',
			code: `
import { a, b, } from 'module';
import React from 'react';
      `.trim(),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		{
			name: 'Module aliases (@/ and ~/)',
			code: `
import React from 'react';
import api from '@/services/api';
import Button from '~/components/Button';
import utils from '@/utils';
  `.trim(),
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
			code: `
export * from './utils';
export { default as Button } from './Button';
export { Input } from './Input';
  `.trim(),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		{
			name: 'Deep relative paths (3+ levels)',
			code: `
import React from 'react';
import config from '../../../../config';
import helper from '../../../helper';
import utils from './utils';
  `.trim(),
			options: [
				{ groups: true, sortStrategies: [{ strategy: 'pathTreeDepth', direction: 'ASC' }] },
			],
		},
		{
			name: 'lineLength DESC > alphabetical ASC',
			code: `
import verylongname from 'verylongname';
import longname from 'longname';
import short from 'short';
import a from 'a';
import b from 'b';
  `.trim(),
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
			code: `
import React from 'react';
import utils from './utils';
  `.trim(),
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
			code: `
import React from 'react';
import api from '@/api';
import config from 'src/config';
import utils from '~/utils';
  `.trim(),
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
			code: `
import fs from 'fs';
import react from 'react';
import utils from './utils';
  `.trim(),
			options: [], // Devrait utiliser DEFAULT_CONFIG
		},
		{
			name: 'Node.js built-in imports with node: prefix',
			code: `
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
  `.trim(),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		{
			name: 'Same length imports (fallback to secondary strategy)',
			code: `
import aaa from 'aaa';
import bbb from 'bbb';
import zzz from 'zzz';
  `.trim(),
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
			code: `
import fs from 'fs';
import react from 'react';
  `.trim(),
			options: [
				{
					groups: false,
					sortStrategies: ['lineLength', 'alphabetical'], // Strings instead of objects
				},
			],
		},
		// =========================================================================
		// DEFAULT CONFIG
		// =========================================================================
		{
			name: 'Sort by pathTreeDepth > alphabetical > line length  ASC (with groups, default config)',
			code: `
import fs from 'fs';
import lodash from 'lodash';
import react from 'react';
import deeperHelper from '../../deeper-helper';
import deeperHelper2 from '../../deeper-helper2';
import feeperHelper3 from '../../feeper-helper3';
import helper from '../../helper';
import helpyr from '../../helpyr';
import config from '../config';
import utils from './utils';
      `.trim(),
		},
	],

	invalid: [
		// =========================================================================
		// SORTING ERRORS - SINGLE STRATEGY
		// =========================================================================
		{
			name: 'Wrong order - lineLength ASC',
			code: `
import lodash from 'lodash';
import fs from 'fs';
      `.trim(),
			output: `
import fs from 'fs';
import lodash from 'lodash';
      `.trim(),
			options: [{ groups: false, sortStrategies: [{ strategy: 'lineLength', direction: 'ASC' }] }],
			errors: [{ messageId: 'lineLengthOrder' }],
		},
		{
			name: 'Wrong order - lineLength DESC',
			code: `
import fs from 'fs';
import lodash from 'lodash';
      `.trim(),
			output: `
import lodash from 'lodash';
import fs from 'fs';
      `.trim(),
			options: [{ groups: false, sortStrategies: [{ strategy: 'lineLength', direction: 'DESC' }] }],
			errors: [{ messageId: 'lineLengthOrder' }],
		},
		{
			name: 'Wrong order - alphabetical ASC',
			code: `
import z from 'z';
import a from 'a';
      `.trim(),
			output: `
import a from 'a';
import z from 'z';
      `.trim(),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
			errors: [{ messageId: 'alphabeticalOrder' }],
		},
		{
			name: 'Wrong order - alphabetical DESC',
			code: `
import a from 'a';
import z from 'z';
      `.trim(),
			output: `
import z from 'z';
import a from 'a';
      `.trim(),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'DESC' }] },
			],
			errors: [{ messageId: 'alphabeticalOrder' }],
		},
		{
			name: 'Wrong order - pathTreeDepth ASC',
			code: `
import utils from './utils';
import helper from '../../helper';
      `.trim(),
			output: `
import helper from '../../helper';
import utils from './utils';
      `.trim(),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'pathTreeDepth', direction: 'ASC' }] },
			],
			errors: [{ messageId: 'pathDepthOrder' }],
		},
		{
			name: 'Wrong order - pathTreeDepth DESC',
			code: `
import helper from '../../helper';
import utils from './utils';
      `.trim(),
			output: `
import utils from './utils';
import helper from '../../helper';
      `.trim(),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'pathTreeDepth', direction: 'DESC' }] },
			],
			errors: [{ messageId: 'pathDepthOrder' }],
		},
		// =========================================================================
		// GROUPING ERRORS
		// =========================================================================
		{
			name: 'Wrong grouping - internal before external',
			code: `
import utils from './utils';
import React from 'react';
      `.trim(),
			output: `
import React from 'react';
import utils from './utils';
      `.trim(),
			options: [{ groups: true, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] }],
			errors: [{ messageId: 'groupingRequired' }],
		},
		{
			name: 'Wrong grouping - mixed external and internal',
			code: `
import React from 'react';
import utils from './utils';
import lodash from 'lodash';
      `.trim(),
			output: `
import lodash from 'lodash';
import React from 'react';
import utils from './utils';
      `.trim(),
			options: [{ groups: true, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] }],
			errors: [{ messageId: 'groupingRequired' }],
		},
		// =========================================================================
		// MULTIPLE ERRORS (SORTING + GROUPING)
		// =========================================================================
		{
			name: 'Wrong order and wrong grouping',
			code: `
import z from 'z';
import a from 'a';
import internal2 from './internal2';
import internal1 from './internal1';
      `.trim(),
			output: `
import a from 'a';
import z from 'z';
import internal1 from './internal1';
import internal2 from './internal2';
      `.trim(),
			options: [{ groups: true, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] }],
			errors: [{ messageId: 'alphabeticalOrder' }],
		},
		{
			name: 'Complex wrong order - multiple strategies',
			code: `
import verylongname from 'verylongname';
import a from 'a';
import z from './z';
import b from './b';
      `.trim(),
			output: `
import a from 'a';
import verylongname from 'verylongname';
import b from './b';
import z from './z';
      `.trim(),
			options: [
				{
					groups: true,
					sortStrategies: [
						{ strategy: 'lineLength', direction: 'ASC' },
						{ strategy: 'alphabetical', direction: 'ASC' },
					],
				},
			],
			errors: [{ messageId: 'lineLengthOrder' }],
		},
		// =========================================================================
		// ERRORS WITH SPECIAL CASES
		// =========================================================================
		{
			name: 'Wrong order - scoped packages',
			code: `
import { Button } from '@myorg/button';
import { api } from '@myorg/api';
      `.trim(),
			output: `
import { api } from '@myorg/api';
import { Button } from '@myorg/button';
      `.trim(),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
			errors: [{ messageId: 'alphabeticalOrder' }],
		},
		{
			name: 'Wrong order - side effects',
			code: `
import React from 'react';
import 'polyfill';
      `.trim(),
			output: `
import 'polyfill';
import React from 'react';
      `.trim(),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
			errors: [{ messageId: 'alphabeticalOrder' }],
		},
		{
			name: 'Wrong order with custom pattern',
			code: `
import utils from 'src/utils';
import React from 'react';
      `.trim(),
			output: `
import React from 'react';
import utils from 'src/utils';
      `.trim(),
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
			code: `
import type { Config } from './config';
import { getData } from './api';
import React from 'react';
import type { User } from './types';
      `.trim(),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
			languageOptions: {
				parser: tsParser,
				parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
			},
		},
		{
			name: 'Mixed import types (ungrouped)',
			code: `
import type { Config } from './types';
import 'polyfill';
import React, { useState } from 'react';
import * as Utils from './utils';
  `.trim(),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
		},
		{
			name: 'Mixed import types (grouped)',
			code: `
import 'polyfill';
import React, { useState } from 'react';
import type { Config } from './types';
import * as Utils from './utils';
  `.trim(),
			options: [{ groups: true, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] }],
		},
	],
	invalid: [
		{
			name: 'TypeScript wrong order',
			code: `
import type { User } from './types';
import { getData } from './api';
import React from 'react';
import type { Config } from './config';
      `.trim(),
			output: `
import type { Config } from './config';
import { getData } from './api';
import React from 'react';
import type { User } from './types';
      `.trim(),
			options: [
				{ groups: false, sortStrategies: [{ strategy: 'alphabetical', direction: 'ASC' }] },
			],
			languageOptions: {
				parser: tsParser,
				parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
			},
			errors: [{ messageId: 'alphabeticalOrder' }],
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
 * to ESLint 8 format (parser / parserOptions). Also removes `name`.
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
// Run RuleTester
// ---------------------------------------------------------------------------
jsRuleTester.run('sort', rule, adaptTestCasesForCompatibility(jsTestCases, IS_ESLINT9_PLUS, false));

tsRuleTester.run('sort', rule, adaptTestCasesForCompatibility(tsTestCases, IS_ESLINT9_PLUS, true));
