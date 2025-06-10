import pluginVue from "eslint-plugin-vue";
import globals from "globals";
import pluginTs from "typescript-eslint";

import type { ConfigOptions } from "options";
import type { Config } from "@eslint/config-helpers";

export const VUE = "**/*.vue";

export function addVue(result: Config[], options: ConfigOptions): void {
	if(options.vue) {
		const files = [VUE];
		result.push(
			...pluginVue.configs["flat/essential"].map(cfg => ({
				...cfg,
				files,
			})),
			{
				name: "General:vue",
				files,
				languageOptions: {
					parserOptions: {
						parser: options.typescript ? pluginTs.parser : undefined,
						extraFileExtensions: [".vue"],
					},
					globals: globals.browser,
				},
				rules: {
					"@stylistic/indent": "off", // see vue
					"@stylistic/max-len": "off", // see vue
					"vue/max-len": ["warn", {
						code: 200,
						ignoreComments: true,
						ignoreHTMLAttributeValues: true,
						ignoreStrings: true,
						tabWidth: 4,
					}],
					"vue/multi-word-component-names": "off",
					"vue/no-mutating-props": ["warn", { shallowOnly: true }],
					"vue/script-indent": ["warn", "tab", {
						baseIndent: 1,
						ignores: [],
						switchCase: 1,
					}],
				},
				settings: options.import && !Array.isArray(options.import) ? {
					"import/extensions": [".vue"],
					"import/external-module-folders": ["node_modules", "node_modules/@types"],
					"import/resolver": {
						typescript: {
							noWarnOnMultipleProjects: true,
							project: options.import.project ?? [],
						},
					},
				} : {},
			}
		);
	}
}
