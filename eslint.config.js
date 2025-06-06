import { createConfig } from "./dist/index.js";

export default [
	...createConfig({
		ignores: ["{node_modules,dist,.rslib}/**/*"],
		import: ["**/*.ts"],
	}),
	{
		rules: {
			"@typescript-eslint/no-magic-numbers": "off",
			"complexity": "off",
			"max-lines": "off",
			"max-lines-per-function": "off",
		},
	},
];
