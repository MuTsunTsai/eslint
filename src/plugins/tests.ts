import pluginMocha from "eslint-plugin-mocha";
import pluginPlaywright from "eslint-plugin-playwright";
import pluginVitest from "@vitest/eslint-plugin";

import { restrictGlobsToExtensions } from "utils";

import type { ConfigOptions } from "options";
import type { Config } from "@eslint/config-helpers";
import type { Linter } from "eslint";

/** Renames the `vitest/*` rules to `rstest/*`. */
function toRstest(rules: Partial<Linter.RulesRecord>): Linter.RulesRecord {
	return Object.fromEntries(
		Object.entries(rules).map(
			([name, entry]) => [name.replace(/^vitest\//, "rstest/"), entry!]
		)
	);
}

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
	const rstest = Array.isArray(options.rstest) ?
		{ files: options.rstest } : options.rstest;
	if(rstest) {
		result.push({
			name: "Rstest",
			files: rstest.files,
			plugins: {
				// Registered under the "rstest" namespace,
				// so that the rules are reported as `rstest/*`
				rstest: pluginVitest,
			},
			settings: {
				// Rstest provides the same API as Vitest,
				// only imported from a different package.
				// The plugin always reads its settings from the "vitest" key.
				vitest: { vitestImports: ["@rstest/core"] },
			},
			rules: {
				...toRstest(pluginVitest.configs.recommended.rules),
				// Chai-style assertions such as `expect(x).to.be.true`
				// are reported as uncalled matchers
				"rstest/valid-expect": "off",
				// Allows sub-suites to be imported from other files,
				// as in `describe("name", subSuite)`
				"rstest/valid-describe-callback": "off",
				"rstest/expect-expect": ["error", {
					assertFunctionNames: ["expect", ...rstest.assertFunctionNames ?? []],
				}],
				"rstest/no-disabled-tests": "off",
				"rstest/no-duplicate-hooks": "error",
				"rstest/padding-around-after-all-blocks": "warn",
				"rstest/padding-around-after-each-blocks": "warn",
				"rstest/padding-around-before-all-blocks": "warn",
				"rstest/padding-around-before-each-blocks": "warn",
				"rstest/padding-around-describe-blocks": "warn",
				"rstest/padding-around-test-blocks": "warn",
			},
		});
	}
	if(options.playwright) {
		result.push({
			...pluginPlaywright.configs["flat/recommended"],
			name: "Playwright",
			files: options.playwright,
		});
	}

	const allTests = [
		...(options.mocha ?? []),
		...(rstest?.files ?? []),
		...(options.playwright ?? []),
	];
	if(allTests.length) {
		result.push({
			name: "General Tests",
			files: allTests,
			rules: {
				"max-classes-per-file": "off",
				"max-lines-per-function": "off",
				// Chai-style assertions such as `expect(x).to.be.true`
				"no-unused-expressions": "off",
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
