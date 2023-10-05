module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	ignorePatterns: ['/dist/*', '/node_modules/*', 'vite.config.ts'],
	extends: 'xo',
	overrides: [
		{
			extends: [
				'xo-typescript',
				'prettier'
			],
			files: [
				'*.ts',
				'*.tsx',
			],
		},
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	rules: {},
}
