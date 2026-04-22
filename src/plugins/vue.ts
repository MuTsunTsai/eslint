import pluginVue from "eslint-plugin-vue";
import globals from "globals";
import pluginTs from "typescript-eslint";

import { errorToWarn } from "utils";

import type { ConfigOptions } from "options";
import type { Config } from "@eslint/config-helpers";

export const VUE = "**/*.vue";

export function addVue(result: Config[], options: ConfigOptions): void {
	if(options.vue) {
		const files = [VUE];
		result.push(
			...pluginVue.configs["flat/strongly-recommended"].map(cfg => ({
				...errorToWarn(cfg),
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
					"vue/attributes-order": "warn",
					"vue/block-order": ["warn", {
						order: ["template", "script", "style"],
					}],
					"vue/component-api-style": "warn",
					"vue/define-macros-order": ["warn", {
						"order": ["defineOptions", "defineModel", "defineProps", "defineEmits", "defineSlots"],
						"defineExposeLast": true,
					}],
					"vue/define-props-declaration": "warn",
					"vue/html-closing-bracket-spacing": ["warn", {
						"selfClosingTag": "never",
					}],
					"vue/html-comment-indent": ["warn", "tab"],
					"vue/html-indent": ["warn", "tab", {
						attribute: 1,
						baseIndent: 1,
						closeBracket: 0,
						alignAttributesVertically: false,
						ignores: [],
					}],
					"vue/html-self-closing": "warn",
					"vue/max-attributes-per-line": ["warn", {
						"singleline": { "max": 3 },
					}],
					"vue/max-len": ["warn", {
						code: 200,
						ignoreComments: true,
						ignoreHTMLAttributeValues: true,
						ignoreStrings: true,
						tabWidth: 4,
					}],
					"vue/multi-word-component-names": "off",
					"vue/multiline-html-element-content-newline": "warn",
					"vue/no-mutating-props": ["warn", { shallowOnly: true }],
					"vue/no-required-prop-with-default": "warn",
					"vue/prefer-define-options": "warn",
					"vue/prefer-use-template-ref": "warn",
					"vue/script-indent": ["warn", "tab", {
						baseIndent: 1,
						ignores: [],
						switchCase: 1,
					}],
					"vue/singleline-html-element-content-newline": "off",
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
