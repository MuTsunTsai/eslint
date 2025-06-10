import pluginMocha from "eslint-plugin-mocha";
import pluginPlaywright from "eslint-plugin-playwright";

import { restrictGlobsToExtensions } from "utils";

import type { ConfigOptions } from "options";
import type { Config } from "@eslint/config-helpers";

export function addTests(result: Config[], options: ConfigOptions): void {
	if(options.mocha) {
		result.push(
			{
				...pluginMocha.configs!.recommended,
				files: options.mocha,
			} as Config,
			{
				name: "Mocha",
				files: options.mocha,
				rules: {
					"prefer-arrow-callback": "off",
					"mocha/prefer-arrow-callback": "warn",
					"mocha/no-exports": "off",
					"mocha/no-pending-tests": "off",
				},
			}
		);
	}
	if(options.playwright) {
		result.push({
			...pluginPlaywright.configs["flat/recommended"],
			name: "Playwright",
			files: options.playwright,
		});
	}

	const allTests = [...(options.mocha ?? []), ...(options.playwright ?? [])];
	if(allTests.length) {
		result.push({
			name: "General Tests",
			files: allTests,
			rules: {
				"max-classes-per-file": "off",
				"max-lines-per-function": "off",
			},
		});
		if(options.typescript) {
			result.push({
				name: "General Tests TypeScript",
				files: restrictGlobsToExtensions(allTests, [".ts", ".tsx", ".mts", ".cts"]),
				rules: {
					"@typescript-eslint/explicit-function-return-type": ["warn", {
						allowFunctionsWithoutTypeParameters: true,
					}],
					"@typescript-eslint/no-invalid-this": "off",
					"@typescript-eslint/no-magic-numbers": "off",
					"@typescript-eslint/no-unused-expressions": "off",
				},
			});
		}
	}
}
