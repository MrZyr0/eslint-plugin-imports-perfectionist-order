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
		{ strategy: SortStrategy.LINE_LENGTH, direction: SortDirection.ASC },
		{ strategy: SortStrategy.ALPHABETICAL, direction: SortDirection.ASC },
	],
});

// ============================================================================
// Utilities
// ============================================================================

/**
 * Checks if an import path is internal
 * @param {string} path - Import path to check
 * @param {RegExp} pattern - Internal pattern to test against
 * @returns {boolean} True if the path matches the internal pattern
 */
function isInternal(path, pattern) {
	return path && pattern.test(path);
}

/**
 * Gets the depth of a relative import
 * @param {string} path - Import path
 * @returns {number} -1 for external, 0 for ./, 1 for ../, 2 for ../../, etc.
 *
 * Uses a regex without ^ to count ALL occurrences of ../
 */
function getPathDepth(path) {
	if (!path) return -1;

	if (path.startsWith('..')) {
		// Fixed regex: counts all occurrences of '../' in the path
		const matches = path.match(/\.\.\//g);
		return matches ? matches.length : 0;
	}

	return path.startsWith('.') ? 0 : -1;
}

/**
 * Extracts the filename or package name from an import path
 * @param {string} path - Import path
 * @returns {string} The filename or package name
 */
function extractFilenameOrPackageName(path) {
	if (!path) return '';

	// Remove query parameters and hashes
	const cleanPath = path.split(/[?#]/)[0];

	// Handle internal paths with @/ or ~/ aliases
	if (cleanPath.startsWith('@/') || cleanPath.startsWith('~/')) {
		// Remove the alias prefix and treat as regular path
		const pathWithoutAlias = cleanPath.substring(2);
		const lastSlash = pathWithoutAlias.lastIndexOf('/');
		const basename =
			lastSlash === -1 ? pathWithoutAlias : pathWithoutAlias.substring(lastSlash + 1);

		// Remove file extension if present
		const lastDot = basename.lastIndexOf('.');
		return lastDot === -1 ? basename : basename.substring(0, lastDot);
	}

	// For scoped packages (e.g., @scope/package)
	if (cleanPath.startsWith('@')) {
		const parts = cleanPath.split('/');
		return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : cleanPath;
	}

	// For regular packages and file paths
	const lastSlash = cleanPath.lastIndexOf('/');
	const basename = lastSlash === -1 ? cleanPath : cleanPath.substring(lastSlash + 1);

	// Remove file extension if present
	const lastDot = basename.lastIndexOf('.');
	return lastDot === -1 ? basename : basename.substring(0, lastDot);
}

/**
 * Extracts the sort key for alphabetical sorting
 * @param {object} imp - Import object with node property
 * @returns {string} Sort key
 *
 * Extracts the correct name for alphabetical sorting
 */
function getAlphabeticalSortKey(imp) {
	const node = imp.node;

	// If no specifiers (side-effect import like import './styles.css')
	if (!node.specifiers || node.specifiers.length === 0) return imp.source || '';

	// Find the first specifier (default, named, or namespace)
	const firstSpecifier = node.specifiers[0];

	// Return the local name of the first specifier
	if (firstSpecifier && firstSpecifier.local && firstSpecifier.local.name)
		return firstSpecifier.local.name;

	// Fallback to path if no name found
	return imp.source || '';
}

/**
 * Normalizes strategy configuration
 * @param {string | object} strategy - Strategy config
 * @returns {object} Normalized strategy
 */
function normalizeStrategy(strategy) {
	if (typeof strategy === 'string') return { strategy, direction: SortDirection.ASC };

	const direction = strategy.direction ? strategy.direction.toUpperCase() : SortDirection.ASC;

	return { strategy: strategy.strategy, direction };
}

// ============================================================================
// Strategy Groupers (each returns array of arrays)
// ============================================================================

/**
 * Groups imports by line length
 * @param {Array} imports - Imports to group
 * @param {string} direction - Sort direction
 * @returns {Array} Grouped imports
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
 * Groups imports by path depth
 * @param {Array} imports - Imports to group
 * @param {string} direction - Sort direction
 * @returns {Array} Grouped imports
 *
 * Fixed sorting logic to respect the expected order
 */
function groupByPathDepth(imports, direction) {
	const groups = new Map();

	for (const imp of imports) {
		const depth = getPathDepth(imp.source);

		if (!groups.has(depth)) groups.set(depth, []);

		groups.get(depth).push(imp);
	}

	// Fixed logic:
	// For ASC: external (-1) first, then decreasing depth (../../ (2) → ../ (1) → ./ (0))
	// For DESC: increasing depth (./ (0) → ../ (1) → ../../ (2)), then external (-1) last
	const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
		if (direction === SortDirection.ASC) {
			// External imports first
			if (a === -1 && b !== -1) return -1;
			if (b === -1 && a !== -1) return 1;
			// For relative paths: descending sort (../../ before ../ before ./)
			return b - a;
		}
		// DESC: local paths first
		if (a === -1 && b !== -1) return 1;
		if (b === -1 && a !== -1) return -1;
		// For relative paths: ascending sort (./ before ../ before ../../)
		return a - b;
	});

	return sortedKeys.map(key => groups.get(key));
}

/**
 * Creates a sorter function for filenames
 * @param {string} direction - Sort direction
 * @returns {function({source: string}, {source: string}): number} Comparison function
 */
function createFilenameSorter(direction) {
	return (a, b) => {
		const keyA = extractFilenameOrPackageName(a.source || '');
		const keyB = extractFilenameOrPackageName(b.source || '');

		const result = keyA.localeCompare(keyB, 'en', { sensitivity: 'base', ignorePunctuation: true });

		return direction === SortDirection.ASC ? result : -result;
	};
}

/**
 * Groups imports by filename or package name
 * @param {Array} imports - Imports to group
 * @param {string} direction - Sort direction
 * @param {RegExp} [internalPattern] - Pattern to identify internal imports
 * @returns {Array} Grouped imports
 */
function groupByFilename(imports, direction, internalPattern) {
	// If we have an internal pattern, group by external/internal first
	if (internalPattern) {
		const groups = new Map();

		for (const imp of imports) {
			const isInternalImport = isInternal(imp.source, internalPattern);
			const groupKey = isInternalImport ? 'internal' : 'external';

			if (!groups.has(groupKey)) {
				groups.set(groupKey, []);
			}

			groups.get(groupKey).push(imp);
		}

		// Sort each group separately
		const result = [];

		// Process external group first
		if (groups.has('external')) {
			const sorted = [...groups.get('external')].sort(createFilenameSorter(direction));
			result.push(...sorted.map(imp => [imp]));
		}

		// Then internal group
		if (groups.has('internal')) {
			const sorted = [...groups.get('internal')].sort(createFilenameSorter(direction));
			result.push(...sorted.map(imp => [imp]));
		}

		return result;
	}

	// No grouping, just sort all imports
	const sorted = [...imports].sort(createFilenameSorter(direction));
	return sorted.map(imp => [imp]);
}

/**
 * Groups imports alphabetically
 * @param {Array} imports - Imports to group
 * @param {string} direction - Sort direction
 * @returns {Array} Grouped imports (each import in its own group for stable sort)
 *
 * Uses getAlphabeticalSortKey to extract the correct name
 */
function groupByAlphabetical(imports, direction) {
	const sorted = [...imports].sort((a, b) => {
		const keyA = getAlphabeticalSortKey(a);
		const keyB = getAlphabeticalSortKey(b);

		const result = keyA.localeCompare(keyB, 'en', { sensitivity: 'base', ignorePunctuation: true });

		return direction === SortDirection.ASC ? result : -result;
	});

	// Return each import in its own group for final ordering
	return sorted.map(imp => [imp]);
}

/**
 * Strategy grouper map
 * Maps strategy names to their corresponding grouping functions
 * @type {{[key: string]: (imports: Array<object>, direction: string) => Array<Array<object>>}}
 */
const strategyGroupers = {
	[SortStrategy.FILENAME]: (imports, direction, config) =>
		groupByFilename(imports, direction, config?.internalPattern),
	[SortStrategy.LINE_LENGTH]: groupByLineLength,
	[SortStrategy.PATH_TREE_DEPTH]: groupByPathDepth,
	[SortStrategy.ALPHABETICAL]: groupByAlphabetical,
};

// ============================================================================
// Recursive Sorting Engine
// ============================================================================

/**
 * Applies sorting strategies recursively
 * Each strategy groups imports, then subsequent strategies are applied to each group
 * @param {Array<object>} imports - Imports to sort
 * @param {Array<{strategy: string, direction: string}>} strategies - Normalized strategies to apply
 * @param {number} [strategyIndex] - Current strategy index
 * @returns {Array<object>} Sorted imports
 * @example
 * // With strategies: [pathTreeDepth, lineLength, alphabetical]
 * // 1. Group by depth: [[external], [../../], [../], [./]]
 * // 2. Within each depth group, group by length
 * // 3. Within each length group, sort alphabetically
 */
function applySortingStrategies(imports, strategies, strategyIndex = 0) {
	// Base case: no more strategies or single/empty import
	if (strategyIndex >= strategies.length || imports.length <= 1) return imports;

	const { strategy, direction } = strategies[strategyIndex];
	const grouper = strategyGroupers[strategy];

	if (!grouper)
		// Unknown strategy, skip it
		return applySortingStrategies(imports, strategies, strategyIndex + 1);

	// Group imports according to current strategy
	const groups = grouper(imports, direction);

	// Recursively apply remaining strategies to each group
	const sortedGroups = groups.map(group =>
		applySortingStrategies(group, strategies, strategyIndex + 1),
	);

	// Flatten and return
	return sortedGroups.flat();
}

// ============================================================================
// Import Analysis
// ============================================================================

/**
 * Groups imports by type (external/internal)
 * @param {Array<object>} imports - Imports to group
 * @param {RegExp} pattern - Internal pattern
 * @param {boolean} shouldGroup - Whether to group
 * @returns {Array<Array<object>>} Grouped imports (external and internal)
 */
function groupByType(imports, pattern, shouldGroup) {
	if (!shouldGroup) return [imports];

	const external = [];
	const internal = [];

	for (const imp of imports)
		if (isInternal(imp.source, pattern)) internal.push(imp);
		else external.push(imp);

	return [external, internal].filter(g => g.length > 0);
}

/**
 * Finds consecutive import groups separated by code
 * @param {Array} imports - All imports
 * @param {string} sourceText - Source code
 * @returns {Array<Array<object>>} - Array of import groups
 */
function findConsecutiveGroups(imports, sourceText) {
	if (imports.length === 0) return [];

	const groups = [];
	let currentGroup = [imports[0]];

	for (let i = 1; i < imports.length; i += 1) {
		const prev = imports[i - 1];
		const current = imports[i];

		// Check if nodes have a range
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
		} else currentGroup.push(current);
	}

	if (currentGroup.length > 0) groups.push(currentGroup);

	return groups;
}

/**
 * Sorts a group of imports according to config
 * @param {Array<object>} group - Import group to sort
 * @param {object} config - Rule configuration
 * @param {boolean} config.groups - Whether to group by external/internal
 * @param {RegExp} config.internalPattern - Pattern to identify internal imports
 * @param {Array<{strategy: string, direction: string}>} strategies - Sorting strategies to apply
 * @returns {Array<object>} Sorted import objects
 */
function sortImportGroup(group, config, strategies) {
	const subGroups = groupByType(group, config.internalPattern, config.groups);
	const sortedSubGroups = subGroups.map(sg => applySortingStrategies(sg, strategies));
	return sortedSubGroups.flat();
}

/**
 * Checks if a group needs sorting and returns details about the issue
 * @param {Array<object>} group - Import group
 * @param {object} config - Rule config
 * @param {Array<object>} strategies - Normalized strategies
 * @returns {{needsSorting: boolean, reason?: string, expected?: string, comparedTo?: string, position?: string, strategy?: string, direction?: string}} Sorting check result
 */
function needsSorting(group, config, strategies) {
	if (group.length <= 1) return { needsSorting: false };

	// Check external/internal grouping if enabled
	if (config.groups) {
		const { internalPattern } = config;
		let lastExternal = -1;
		let firstInternal = group.length;

		// Find first internal and last external import positions
		for (let index = 0; index < group.length; index += 1) {
			const imp = group[index];
			if (isInternal(imp.source, internalPattern) && index < firstInternal) firstInternal = index;
			else if (!isInternal(imp.source, internalPattern) && index > lastExternal)
				lastExternal = index;
		}

		// If any external imports come after internal ones, needs sorting
		if (lastExternal > firstInternal) {
			const externalImp = group[lastExternal];
			const internalImp = group[firstInternal];
			return {
				needsSorting: true,
				reason: 'grouping',
				expected: externalImp.source,
				comparedTo: internalImp.source,
				position: 'before',
			};
		}
	}

	// Check if sorting strategies would change the order
	const sorted = sortImportGroup(group, config, strategies);
	const needsSort = !group.every((imp, index) => imp.text === sorted[index].text);

	if (!needsSort) return { needsSorting: false };

	// Find the first position where the order is incorrect
	for (let i = 0; i < group.length; i += 1) {
		if (group[i].text !== sorted[i].text) {
			const current = group[i];
			const expected = sorted.find(imp => imp.text === current.text);
			const expectedIndex = sorted.indexOf(expected);
			const comparedTo = expectedIndex > 0 ? sorted[expectedIndex - 1] : sorted[expectedIndex + 1];

			// Determine which strategy caused the sort
			const strategy = strategies[0]; // The first strategy in the chain is the primary one

			return {
				needsSorting: true,
				reason: 'order',
				expected: current.source,
				comparedTo: comparedTo.source,
				position: expectedIndex < i ? 'before' : 'after',
				strategy: strategy.strategy,
				direction: strategy.direction,
			};
		}
	}

	return { needsSorting: false };
}

/**
 * Generates sorted import text from a group of imports
 * @param {Array<object>} group - Import group to process
 * @param {object} config - Rule configuration
 * @param {Array<{strategy: string, direction: string}>} strategies - Sorting strategies
 * @returns {string} Formatted import statements as a single string
 */
function generateSortedText(group, config, strategies) {
	const sorted = sortImportGroup(group, config, strategies);
	return sorted.map(imp => imp.text).join('\n');
}

/**
 * Parses and validates rule options
 * @param {object} options - Raw options object
 * @returns {object} Normalized and validated configuration object
 * @property {boolean} groups - Whether to group by external/internal
 * @property {RegExp} internalPattern - Pattern to identify internal imports
 * @property {Array<{strategy: string, direction: string}>} sortStrategies - Normalized sort strategies
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
		options.sortStrategies.length > 0 &&
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
			sortImports: 'Imports should be sorted according to the configured strategies',
			invalidSortOrder:
				'Incorrect import order. "{{expected}}" should come {{position}} "{{comparedTo}}"',
			groupingRequired: 'Imports should be grouped by type (external vs internal)',
			lineLengthOrder: 'Imports should be sorted by line length ({{direction}})',
			pathDepthOrder: 'Imports should be sorted by path depth ({{direction}})',
			alphabeticalOrder: 'Imports should be sorted alphabetically ({{direction}})',
		},
	},

	create(context) {
		const sourceCode = context.sourceCode ?? context.getSourceCode();
		const config = parseConfig(context.options[0] ?? DEFAULT_OPTIONS);
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
				const importGroups = findConsecutiveGroups(imports, sourceCode.getText());

				for (const group of importGroups) {
					const sortResult = needsSorting(group, config, config.sortStrategies);

					if (sortResult.needsSorting) {
						const sortedText = generateSortedText(group, config, config.sortStrategies);

						// Select appropriate message based on the reason and strategy
						let messageId;
						const data = {};

						// Set direction for order-related messages
						if (sortResult.direction) {
							data.direction = sortResult.direction;
						} else if (sortResult.reason === 'order') {
							data.direction = 'ASC'; // Default direction if not specified
						}

						// Handle grouping errors
						if (sortResult.reason === 'grouping') {
							messageId = 'groupingRequired';
						}
						// Handle order errors with specific strategy messages
						else if (sortResult.reason === 'order' && sortResult.strategy) {
							switch (sortResult.strategy) {
								case 'lineLength':
									messageId = 'lineLengthOrder';
									break;
								case 'pathTreeDepth':
									messageId = 'pathDepthOrder';
									break;
								case 'alphabetical':
								default:
									messageId = 'alphabeticalOrder';
							}
						}

						// If we have specific import information, add it to the data object
						if (sortResult.expected && sortResult.comparedTo) {
							data.expected = sortResult.expected;
							data.comparedTo = sortResult.comparedTo;
							data.position = sortResult.position || 'before';

							// Only use invalidSortOrder for complex cases where we can't be more specific
							if (!messageId) {
								messageId = 'invalidSortOrder';
								data.direction = sortResult.strategy || 'alphabetical';
							}
						} else if (!messageId) {
							// Fallback to generic message if no specific message was set
							messageId = 'sortImports';
						}

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
