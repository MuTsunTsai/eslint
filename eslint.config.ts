import { defineConfig } from "eslint/config";

import { createConfig } from "./dist/index.js";

export default defineConfig([
	...createConfig({
		ignores: ["{node_modules,dist,.rslib}/**/*"],
		import: {
			files: ["**/*.ts", "eslint.config.ts"],
			project: [
				"src",
				"test",
			],
		},
		globals: {
			esm: ["**/*.ts", "test/mocha.env.js"],
		},
		mocha: ["test/**"],
	}),
	{
		rules: {
			"complexity": "off",
			"max-lines": "off",
			"max-lines-per-function": "off",
		},
	},
]);
