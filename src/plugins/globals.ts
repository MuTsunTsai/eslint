import globals from "globals";

import type { Config } from "@eslint/config-helpers";
import type { ConfigOptions } from "options";

export function addGlobals(result: Config[], options: ConfigOptions): void {
	if(options.globals?.cjs) {
		result.push({
			name: "Node CommonJS files",
			files: options.globals.cjs,
			languageOptions: {
				globals: globals.node,
				sourceType: "commonjs",
			},
			rules: options.typescript ? {
				"@typescript-eslint/no-require-imports": "off",
			} : {},
		});
	}
	if(options.globals?.esm) {
		result.push({
			name: "Node ESModule files",
			files: options.globals.esm,
			languageOptions: {
				globals: globals.nodeBuiltin,
			},
		});
	}
	if(options.globals?.browser) {
		result.push(
			{
				name: "Browser global",
				files: options.globals.browser,
				languageOptions: {
					globals: globals.browser,
				},
			}
		);
	}
}
