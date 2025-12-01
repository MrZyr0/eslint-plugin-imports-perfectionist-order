import fs from 'fs';
import sortRule from './lib/rules/sort.js';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

const plugin = {
	meta: { name: pkg.name, version: pkg.version, namespace: pkg.name.replace('eslint-plugin-', '') },
	configs: {},
	rules: { sort: sortRule },
	processors: {},
};

export default plugin;
