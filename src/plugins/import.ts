import pluginImport from "eslint-plugin-import";

import { restrictGlobsToExtensions } from "utils";

import type { ConfigOptions } from "options";
import type { Config } from "@eslint/config-helpers";

export function addImport(result: Config[], options: ConfigOptions): void {
	if(options.import) {
		// Downward compatibility
		if(Array.isArray(options.import)) options.import = { files: options.import };

		const ts = pluginImport.flatConfigs.typescript;
		result.push({
			name: "Plugin:import",
			files: options.import.files,
			plugins: {
				import: pluginImport,
			},
			rules: {
				"import/consistent-type-specifier-style": ["warn", "prefer-top-level"],
				"import/newline-after-import": "warn",
				"import/no-cycle": [
					"warn",
					{
						ignoreExternal: true,
						allowUnsafeDynamicCyclicDependency: options.import.allowUnsafeDynamicCyclicDependency ?? true,
					},
				],
				"import/no-duplicates": "warn",
				"import/no-unresolved": [
					"error",
					{
						// https://github.com/import-js/eslint-plugin-import/issues/2703
						ignore: [
							"eslint-plugin-compat",
							...options.import.ignore ?? [],
						],
					},
				],
				"import/order": ["warn", {
					"groups": [
						[
							"builtin",
							"external",
						],
						[
							"internal",
							"parent",
							"sibling",
							"index",
							"object",
						],
						"type",
					],
					"newlines-between": "always",
				}],
				"no-duplicate-imports": "off",
				"sort-imports": "off",
			},
			settings: options.typescript ? {
				...ts.settings,
				"import/resolver": {
					typescript: {
						noWarnOnMultipleProjects: true,
						project: options.import.project ?? [],
					},
				},
			} : {},
		});
		if(options.typescript) {
			const ext = [".ts", ".tsx", ".mts", ".cts"];
			if(options.vue) ext.push(".vue");
			const files = restrictGlobsToExtensions(options.import.files, ext);
			result.push({
				name: "Plugin:import TypeScript",
				files,
				rules: {
					"@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],
				},
			});
		}
	}
}
