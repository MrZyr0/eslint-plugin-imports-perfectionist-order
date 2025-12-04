'use strict';

// ============================================================================
// Constants
// ============================================================================

const SortStrategy = Object.freeze({
	LINE_LENGTH: 'lineLength',
	PATH_TREE_DEPTH: 'pathTreeDepth',
	ALPHABETICAL: 'alphabetical',
	FILENAME: 'filename',
});

const SortDirection = Object.freeze({ ASC: 'ASC', DESC: 'DESC' });

const DEFAULT_CONFIG = Object.freeze({
	groups: true,
	internalPattern: '^(@/|\\.\\.?/)',
	sortStrategies: [
		{ strategy: SortStrategy.PATH_TREE_DEPTH, direction: SortDirection.ASC },
		{ strategy: SortStrategy.FILENAME, direction: SortDirection.ASC },
		{ strategy: SortStrategy.ALPHABETICAL, direction: SortDirection.ASC },
		{ strategy: SortStrategy.LINE_LENGTH, direction: SortDirection.ASC },
	],
	sortDestructuredImports: false,
});

// Compiled regex patterns
const REGEX = Object.freeze({
	TYPE_PREFIX: /^type\s+(?<typeSpec>.+)$/,
	AS_SEPARATOR: /\s+as\s+/,
	PARENT_DIR: /\.\.\//g,
	MIXED_IMPORT:
		/import\s+(?:(?<defaultImport>[^,{]+)\s*,\s*)?\{(?<specifiers>[^}]+)\}\s*from\s+(?<source>['"][^'"]+['"])(?<semicolon>\s*;?)/,
	DESTRUCTURED_IMPORT:
		/import\s+(?<typeKeyword>type\s+)?\{(?<specifiers>[^}]+)\}\s*from\s+(?<source>['"][^'"]+['"])(?<semicolon>\s*;?)/,
	INDENT: /^(?<indent>\s*)/,
});

// ============================================================================
// Utilities
// ============================================================================

/**
 * Extracts the base name from a specifier (handles aliases and type imports)
 * @param {string} spec - The specifier to process
 * @returns {string} The base name
 */
function extractName(spec) {
	// Remove 'type ' prefix if present
	const cleaned = spec.replace(/^type\s+/, '');
	// Extract name before 'as' if present
	return cleaned.split(REGEX.AS_SEPARATOR)[0].trim();
}

/**
 * Extracts destructured import specifiers
 * @param {string} importText - The import statement text
 * @returns {string[]} Array of specifier names
 */
function extractSpecifiers(importText) {
	// Handle mixed imports: import React, { ... } from '...'
	const mixedMatch = importText.match(REGEX.MIXED_IMPORT);
	if (mixedMatch) {
		return mixedMatch.groups.specifiers
			.split(',')
			.map(s => s.trim())
			.map(s => {
				const typeMatch = s.match(REGEX.TYPE_PREFIX);
				return typeMatch ? typeMatch.groups.typeSpec : s;
			});
	}

	// Handle pure destructured imports
	const destructuredMatch = importText.match(REGEX.DESTRUCTURED_IMPORT);
	if (destructuredMatch) {
		return destructuredMatch.groups.specifiers
			.split(',')
			.map(s => s.trim())
			.map(s => {
				const typeMatch = s.match(REGEX.TYPE_PREFIX);
				return typeMatch ? typeMatch.groups.typeSpec : s;
			});
	}

	return [];
}

/**
 * Sorts destructured import specifiers alphabetically
 * @param {string} importText - The full import statement text
 * @returns {string} The import statement with sorted specifiers
 */
function sortDestructuredSpecifiers(importText) {
	const isMultiLine = importText.includes('\n');

	// Handle mixed imports: import React, { ... } from '...'
	const mixedMatch = importText.match(REGEX.MIXED_IMPORT);
	if (mixedMatch) {
		const { defaultImport, specifiers: specifiersText, source, semicolon } = mixedMatch.groups;
		const specifiers = specifiersText
			.split(',')
			.map(s => s.trim())
			.filter(s => s.length > 0);

		const sortedSpecifiers = specifiers.sort((a, b) => {
			const nameA = extractName(a);
			const nameB = extractName(b);
			return nameA.localeCompare(nameB, 'en', { sensitivity: 'base', ignorePunctuation: true });
		});

		if (isMultiLine) {
			const lines = importText.split('\n');
			const indentMatch = lines[1]?.match(REGEX.INDENT);
			const indent = indentMatch ? indentMatch.groups.indent : '  ';
			const sortedText = sortedSpecifiers.map(spec => `${indent}${spec}`).join(',\n');
			const defaultText = defaultImport ? `${defaultImport}, ` : '';
			return `import ${defaultText}{\n${sortedText}\n} from ${source}${semicolon}`;
		}

		const sortedText = sortedSpecifiers.join(', ');
		const defaultText = defaultImport ? `${defaultImport}, ` : '';
		return `import ${defaultText}{ ${sortedText} } from ${source}${semicolon}`;
	}

	// Handle pure destructured imports
	const destructuredMatch = importText.match(REGEX.DESTRUCTURED_IMPORT);
	if (!destructuredMatch) return importText;

	const { typeKeyword, specifiers: specifiersText, source, semicolon } = destructuredMatch.groups;
	const specifiers = specifiersText
		.split(',')
		.map(s => s.trim())
		.filter(s => s.length > 0);

	const sortedSpecifiers = specifiers.sort((a, b) => {
		const nameA = extractName(a);
		const nameB = extractName(b);
		return nameA.localeCompare(nameB, 'en', { sensitivity: 'base', ignorePunctuation: true });
	});

	if (isMultiLine) {
		const lines = importText.split('\n');
		const indentMatch = lines[1]?.match(REGEX.INDENT);
		const indent = indentMatch ? indentMatch.groups.indent : '  ';
		const sortedText = sortedSpecifiers.map(spec => `${indent}${spec}`).join(',\n');
		const typePrefix = typeKeyword || '';
		return `import ${typePrefix}{${sortedText ? `\n${sortedText}\n` : ''}} from ${source}${semicolon}`;
	}

	const sortedText = sortedSpecifiers.join(', ');
	const typePrefix = typeKeyword || '';
	return `import ${typePrefix}{ ${sortedText} } from ${source}${semicolon}`;
}

/**
 * Checks if an import path is internal
 * @param {string} path - Import path
 * @param {RegExp} pattern - Internal pattern
 * @returns {boolean} True if path is internal
 */
function isInternal(path, pattern) {
	return path && pattern.test(path);
}

/**
 * Gets the depth of a relative import
 * @param {string} path - Import path
 * @returns {number} Path depth value
 */
function getPathDepth(path) {
	if (!path) return -1;
	if (path.startsWith('..')) {
		const matches = path.match(REGEX.PARENT_DIR);
		return matches ? matches.length : 0;
	}
	return path.startsWith('.') ? 0 : -1;
}

/**
 * Extracts the filename or package name from an import path
 * @param {string} path - Import path
 * @returns {string} Filename or package name
 */
function getFilenameOrPackage(path) {
	if (!path) return '';

	// Remove query parameters and hashes
	const cleanPath = path.split(/[?#]/)[0];

	// Handle scoped packages (e.g., @emotion/react, @mui/material)
	if (cleanPath.startsWith('@') && !cleanPath.startsWith('@/')) {
		const parts = cleanPath.split('/');
		return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : cleanPath;
	}

	// Extract filename from path (for aliases like @/services/api and regular paths)
	const lastSlash = cleanPath.lastIndexOf('/');
	const basename = lastSlash === -1 ? cleanPath : cleanPath.substring(lastSlash + 1);

	// Remove file extension
	const lastDot = basename.lastIndexOf('.');
	return lastDot === -1 ? basename : basename.substring(0, lastDot);
}

/**
 * Extracts the sort key for alphabetical sorting
 * @param {object} imp - Import object
 * @returns {string} Sort key for alphabetical comparison
 */
function getAlphabeticalKey(imp) {
	const node = imp.node;

	// Side-effect import
	if (!node.specifiers || node.specifiers.length === 0) {
		return imp.source || '';
	}

	// Use first specifier name
	const firstSpecifier = node.specifiers[0];
	if (firstSpecifier?.local?.name) {
		return firstSpecifier.local.name;
	}

	// Fallback to source
	return imp.source || '';
}

/**
 * Normalizes strategy configuration
 * @param {string|object} strategy - Strategy config
 * @returns {object} Normalized strategy object
 */
function normalizeStrategy(strategy) {
	if (typeof strategy === 'string') {
		return { strategy, direction: SortDirection.ASC };
	}

	const direction = strategy.direction ? strategy.direction.toUpperCase() : SortDirection.ASC;

	return { strategy: strategy.strategy, direction };
}

// ============================================================================
// Strategy Groupers
// ============================================================================

/**
 * Groups imports by line length
 * @param {Array} imports - Array of import objects
 * @param {string} direction - Sort direction
 * @returns {Array<Array>} Grouped imports by line length
 */
function groupByLineLength(imports, direction) {
	const groups = new Map();

	for (const imp of imports) {
		const key = imp.text.length;
		if (!groups.has(key)) groups.set(key, []);
		groups.get(key).push(imp);
	}

	const sortedKeys = Array.from(groups.keys()).sort((a, b) =>
		direction === SortDirection.ASC ? a - b : b - a,
	);

	return sortedKeys.map(key => groups.get(key));
}

/**
 * Gets priority value for path depth sorting
 * @param {number} depth - Path depth value
 * @param {string} direction - Sort direction
 * @returns {number} Priority value for sorting
 */
function getPriority(depth, direction) {
	if (direction === SortDirection.ASC) {
		// ASC: external (-1) first, then deeper paths (2 > 1 > 0)
		return depth === -1 ? -1000 : -depth; // [-1000, 0, -1, -2]
	}
	// DESC: shallow paths first (0 > 1 > 2), then external (-1)
	return depth === -1 ? 1000 : depth; // [0, 1, 2, 1000]
}

/**
 * Groups imports by path depth
 * @param {Array} imports - Array of import objects
 * @param {string} direction - Sort direction
 * @returns {Array<Array>} Grouped imports by path depth
 */
function groupByPathDepth(imports, direction) {
	const groups = new Map();

	for (const imp of imports) {
		const depth = getPathDepth(imp.source);
		if (!groups.has(depth)) groups.set(depth, []);
		groups.get(depth).push(imp);
	}

	const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
		return getPriority(a, direction) - getPriority(b, direction);
	});

	return sortedKeys.map(key => groups.get(key));
}

/**
 * Groups imports by filename or package name
 * @param {Array} imports - Array of import objects
 * @param {string} direction - Sort direction
 * @returns {Array<Array>} Grouped imports by filename
 */
function groupByFilename(imports, direction) {
	const sorted = [...imports].sort((a, b) => {
		const keyA = getFilenameOrPackage(a.source || '');
		const keyB = getFilenameOrPackage(b.source || '');
		const result = keyA.localeCompare(keyB, 'en', { sensitivity: 'base', ignorePunctuation: true });
		return direction === SortDirection.ASC ? result : -result;
	});

	// Return each import in its own group
	return sorted.map(imp => [imp]);
}

/**
 * Groups imports alphabetically
 * @param {Array} imports - Array of import objects
 * @param {string} direction - Sort direction
 * @returns {Array<Array>} Grouped imports alphabetically
 */
function groupByAlphabetical(imports, direction) {
	const sorted = [...imports].sort((a, b) => {
		const keyA = getAlphabeticalKey(a);
		const keyB = getAlphabeticalKey(b);
		const result = keyA.localeCompare(keyB, 'en', { sensitivity: 'base', ignorePunctuation: true });
		return direction === SortDirection.ASC ? result : -result;
	});

	return sorted.map(imp => [imp]);
}

/**
 * Strategy grouper map
 */
const strategyGroupers = {
	[SortStrategy.LINE_LENGTH]: groupByLineLength,
	[SortStrategy.PATH_TREE_DEPTH]: groupByPathDepth,
	[SortStrategy.FILENAME]: groupByFilename,
	[SortStrategy.ALPHABETICAL]: groupByAlphabetical,
};

// ============================================================================
// Recursive Sorting Engine
// ============================================================================

/**
 * Applies sorting strategies recursively to imports
 * @param {Array} imports - Array of import objects
 * @param {Array} strategies - Array of strategy objects
 * @param {number} strategyIndex - Current strategy index
 * @returns {Array} Sorted imports array
 */
function applySortingStrategies(imports, strategies, strategyIndex = 0) {
	if (strategyIndex >= strategies.length || imports.length <= 1) {
		return imports;
	}

	const { strategy, direction } = strategies[strategyIndex];
	const grouper = strategyGroupers[strategy];

	if (!grouper) {
		return applySortingStrategies(imports, strategies, strategyIndex + 1);
	}

	const groups = grouper(imports, direction);
	const sortedGroups = groups.map(group =>
		applySortingStrategies(group, strategies, strategyIndex + 1),
	);

	return sortedGroups.flat();
}

// ============================================================================
// Import Analysis
// ============================================================================

/**
 * Groups imports by external/internal type
 * @param {Array} imports - Array of import objects
 * @param {RegExp} pattern - Pattern for internal imports
 * @param {boolean} shouldGroup - Whether to group by type
 * @returns {Array<Array>} Grouped imports by type
 */
function groupByType(imports, pattern, shouldGroup) {
	if (!shouldGroup) return [imports];

	const external = [];
	const internal = [];

	for (const imp of imports) {
		if (isInternal(imp.source, pattern)) {
			internal.push(imp);
		} else {
			external.push(imp);
		}
	}

	return [external, internal].filter(g => g.length > 0);
}

/**
 * Finds consecutive import groups in source code
 * @param {Array} imports - Array of import objects
 * @param {string} sourceText - Source code text
 * @returns {Array<Array>} Array of import groups
 */
function findConsecutiveGroups(imports, sourceText) {
	if (imports.length === 0) return [];

	const groups = [];
	let currentGroup = [imports[0]];

	for (let i = 1; i < imports.length; i += 1) {
		const prev = imports[i - 1];
		const current = imports[i];

		if (!prev.range || !current.range) {
			groups.push(currentGroup);
			currentGroup = [current];
			continue;
		}

		const between = sourceText.slice(prev.range[1], current.range[0]).trim();
		const hasCode = between && !between.startsWith('\n');

		if (hasCode) {
			groups.push(currentGroup);
			currentGroup = [current];
		} else {
			currentGroup.push(current);
		}
	}

	if (currentGroup.length > 0) groups.push(currentGroup);

	return groups;
}

/**
 * Sorts a group of imports according to configuration
 * @param {Array} group - Array of import objects
 * @param {object} config - Rule configuration object
 * @param {Array} strategies - Array of strategy objects
 * @returns {Array} Sorted import objects
 */
function sortImportGroup(group, config, strategies) {
	const subGroups = groupByType(group, config.internalPattern, config.groups);
	const sortedSubGroups = subGroups.map(sg => applySortingStrategies(sg, strategies));
	return sortedSubGroups.flat();
}

/**
 * Checks if destructured imports need sorting
 * @param {Array} group - Array of import objects
 * @returns {object|null} Error details or null
 */
function checkDestructuredSorting(group) {
	for (const imp of group) {
		const sortedText = sortDestructuredSpecifiers(imp.text);
		if (sortedText !== imp.text) {
			const currentSpecifiers = extractSpecifiers(imp.text);
			const sortedSpecifiers = extractSpecifiers(sortedText);

			for (let i = 0; i < currentSpecifiers.length; i += 1) {
				if (currentSpecifiers[i] !== sortedSpecifiers[i]) {
					return { expected: sortedSpecifiers[i], comparedTo: currentSpecifiers[i] };
				}
			}
		}
	}
	return null;
}

/**
 * Checks if a group of imports needs sorting
 * @param {Array} group - Array of import objects
 * @param {object} config - Rule configuration object
 * @param {Array} strategies - Array of strategy objects
 * @returns {object} Sorting check result with details
 */
function needsSorting(group, config, strategies) {
	// Single import: check destructured only
	if (group.length <= 1) {
		if (config.sortDestructuredImports && group.length === 1) {
			const destructuredError = checkDestructuredSorting(group);
			if (destructuredError) {
				return { needsSorting: true, reason: 'destructured', ...destructuredError };
			}
		}
		return { needsSorting: false };
	}

	// Check external/internal grouping
	if (config.groups) {
		let lastExternal = -1;
		let firstInternal = group.length;

		for (let i = 0; i < group.length; i += 1) {
			if (isInternal(group[i].source, config.internalPattern)) {
				if (firstInternal === group.length) firstInternal = i;
			} else {
				lastExternal = i;
			}
		}

		if (lastExternal > firstInternal) {
			return {
				needsSorting: true,
				reason: 'grouping',
				expected: group[lastExternal].source,
				comparedTo: group[firstInternal].source,
			};
		}
	}

	// Check if strategies would change order
	if (strategies?.length > 0) {
		const sorted = sortImportGroup(group, config, strategies);
		const needsStrategySort = !group.every((imp, i) => imp.text === sorted[i].text);

		if (needsStrategySort) {
			// Find first mismatch
			for (let i = 0; i < group.length; i += 1) {
				if (group[i].text !== sorted[i].text) {
					return {
						needsSorting: true,
						reason: 'order',
						strategy: strategies[0].strategy,
						direction: strategies[0].direction,
						expected: group[i].source,
						comparedTo: sorted[i].source,
					};
				}
			}
		}
	}

	// Check destructured imports
	if (config.sortDestructuredImports) {
		const destructuredError = checkDestructuredSorting(group);
		if (destructuredError) {
			return { needsSorting: true, reason: 'destructured', ...destructuredError };
		}
	}

	return { needsSorting: false };
}

/**
 * Generates sorted import text from a group
 * @param {Array} group - Array of import objects
 * @param {object} config - Rule configuration object
 * @param {Array} strategies - Array of strategy objects
 * @returns {string} Sorted import text
 */
function generateSortedText(group, config, strategies) {
	// Sort imports
	const sorted = strategies?.length > 0 ? sortImportGroup(group, config, strategies) : group;

	// Convert to text
	let text = sorted.map(imp => imp.text).join('\n');

	// Apply destructured sorting if enabled
	if (config.sortDestructuredImports) {
		const lines = text.split('\n');
		const result = [];
		let i = 0;

		while (i < lines.length) {
			const line = lines[i];

			// Check for multi-line import start
			if (
				(line.includes('import {') || line.includes('import type {')) &&
				!line.includes('} from')
			) {
				// Find end of multi-line import
				let j = i + 1;
				while (j < lines.length && !lines[j].includes('} from')) {
					j += 1;
				}

				const multiLineImport = lines.slice(i, j + 1).join('\n');
				result.push(sortDestructuredSpecifiers(multiLineImport));
				i = j + 1;
			} else {
				result.push(sortDestructuredSpecifiers(line));
				i += 1;
			}
		}

		text = result.join('\n');
	}

	return text;
}

/**
 * Parses and validates rule configuration options
 * @param {object} options - Raw options object
 * @returns {object} Parsed and validated configuration
 */
function parseConfig(options = {}) {
	let internalPattern;
	try {
		const pattern = options.internalPattern || DEFAULT_CONFIG.internalPattern;
		internalPattern = new RegExp(pattern);
	} catch {
		internalPattern = new RegExp(DEFAULT_CONFIG.internalPattern);
	}

	const validStrategies = Object.values(SortStrategy);
	const strategies =
		Array.isArray(options.sortStrategies) &&
		options.sortStrategies.every(s => {
			const strat = typeof s === 'string' ? s : s.strategy;
			return validStrategies.includes(strat);
		})
			? options.sortStrategies
			: DEFAULT_CONFIG.sortStrategies;

	return Object.freeze({
		groups: options.groups ?? DEFAULT_CONFIG.groups,
		internalPattern,
		sortStrategies: strategies.map(normalizeStrategy),
		sortDestructuredImports:
			options.sortDestructuredImports ?? DEFAULT_CONFIG.sortDestructuredImports,
	});
}

// ============================================================================
// Rule Definition
// ============================================================================

const DEFAULT_OPTIONS = {
	groups: true,
	sortStrategies: [
		{ strategy: SortStrategy.PATH_TREE_DEPTH, direction: SortDirection.ASC },
		{ strategy: SortStrategy.FILENAME, direction: SortDirection.ASC },
		{ strategy: SortStrategy.ALPHABETICAL, direction: SortDirection.ASC },
		{ strategy: SortStrategy.LINE_LENGTH, direction: SortDirection.ASC },
	],
};

export default {
	meta: {
		type: 'layout',
		docs: {
			description: 'Sort imports with configurable strategies',
			category: 'Stylistic Issues',
			recommended: false,
			url: 'https://github.com/MrZyr0/eslint-plugin-imports-perfectionist-order',
		},
		fixable: 'code',
		schema: [
			{
				type: 'object',
				properties: {
					groups: { type: 'boolean', description: 'Group external and internal imports' },
					internalPattern: { type: 'string', description: 'Regex pattern for internal imports' },
					sortDestructuredImports: {
						type: 'boolean',
						description: 'Sort destructured import specifiers alphabetically',
					},
					sortStrategies: {
						type: 'array',
						description: 'Sorting strategies to apply in order',
						items: {
							oneOf: [
								{ type: 'string', enum: Object.values(SortStrategy) },
								{
									type: 'object',
									properties: {
										strategy: { type: 'string', enum: Object.values(SortStrategy) },
										direction: { type: 'string', enum: Object.values(SortDirection) },
									},
									required: ['strategy'],
									additionalProperties: false,
								},
							],
						},
					},
				},
				additionalProperties: false,
			},
		],
		defaultOptions: [DEFAULT_OPTIONS],
		messages: {
			sortImports: 'Imports should be sorted according to configured strategies',
			groupingRequired: 'External imports should come before internal imports',
			orderRequired: 'Imports should be sorted by {{strategy}} ({{direction}})',
			destructuredOrder:
				"Import specifiers should be sorted alphabetically. '{{expected}}' should come before '{{comparedTo}}'.",
		},
	},

	create(context) {
		const sourceCode = context.sourceCode ?? context.getSourceCode();
		const config = parseConfig(context.options[0]) ?? DEFAULT_CONFIG;
		const imports = [];

		return {
			ImportDeclaration(node) {
				imports.push({
					node,
					source: node.source.value,
					text: sourceCode.getText(node),
					range: node.range,
				});
			},

			'Program:exit'() {
				const groups = findConsecutiveGroups(imports, sourceCode.getText());

				for (const group of groups) {
					const result = needsSorting(group, config, config.sortStrategies);

					if (result.needsSorting) {
						let messageId = 'sortImports';
						const data = {};

						if (result.reason === 'grouping') {
							messageId = 'groupingRequired';
						} else if (result.reason === 'destructured') {
							messageId = 'destructuredOrder';
							data.expected = result.expected;
							data.comparedTo = result.comparedTo;
						} else if (result.reason === 'order') {
							messageId = 'orderRequired';
							data.strategy = result.strategy;
							data.direction = result.direction;
						}

						const sortedText = generateSortedText(group, config, config.sortStrategies);

						context.report({
							node: group[0].node,
							messageId,
							data,
							fix: fixer => {
								const start = group[0].node.range[0];
								const end = group[group.length - 1].node.range[1];
								return fixer.replaceTextRange([start, end], sortedText);
							},
						});
					}
				}
			},
		};
	},
};
