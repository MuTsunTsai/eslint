import pluginStyle from "@stylistic/eslint-plugin";

import { errorToWarn } from "../utils";

import type { Config } from "@eslint/config-helpers";

const preset = errorToWarn(pluginStyle.configs.recommended);

export default [
	{
		name: "Stylistic recommended",
		...preset,
	},
	{
		name: "Stylistic override",
		rules: {
			"@stylistic/array-bracket-newline": ["warn", "consistent"],
			"@stylistic/arrow-parens": ["warn", "as-needed"],
			"@stylistic/brace-style": [
				"warn",
				"1tbs",
				{
					allowSingleLine: true,
				},
			],
			"@stylistic/comma-dangle": [
				"warn",
				{
					arrays: "always-multiline",
					enums: "always-multiline",
					exports: "never",
					functions: "never",
					imports: "never",
					objects: "always-multiline",
				},
			],
			"@stylistic/generator-star-spacing": [
				"warn",
				{
					after: true,
					anonymous: "neither",
					before: false,
					method: {
						after: false,
						before: true,
					},
				},
			],
			"@stylistic/indent": ["warn", "tab", {
				flatTernaryExpressions: true,
				SwitchCase: 1,
			}],
			"@stylistic/indent-binary-ops": "off",
			"@stylistic/jsx-closing-tag-location": "off",
			"@stylistic/jsx-curly-newline": "off",
			"@stylistic/jsx-indent-props": ["warn", "tab"],
			"@stylistic/jsx-one-expression-per-line": "off",
			"@stylistic/jsx-wrap-multilines": "off",
			"@stylistic/key-spacing": [
				"warn",
				{
					afterColon: true,
					mode: "strict",
				},
			],
			"@stylistic/keyword-spacing": [
				"warn",
				{
					overrides: {
						if: { after: false },
						for: { after: false },
						while: { after: false },
					},
				},
			],
			"@stylistic/lines-between-class-members": "off",
			"@stylistic/max-len": [
				"warn",
				{
					code: 120,
					ignoreComments: true,
					ignoreRegExpLiterals: true,
					ignoreStrings: true,
					ignoreTemplateLiterals: true,
					tabWidth: 4,
				},
			],
			"@stylistic/max-statements-per-line": [
				"warn",
				{
					max: 2,
				},
			],
			"@stylistic/member-delimiter-style": [
				"warn",
				{
					singleline: {
						delimiter: "comma",
						requireLast: false,
					},
				},
			],
			"@stylistic/multiline-ternary": "off",
			"@stylistic/no-mixed-operators": "off",
			"@stylistic/no-mixed-spaces-and-tabs": ["warn", "smart-tabs"],
			"@stylistic/no-multiple-empty-lines": ["warn", {
				max: 1,
				maxEOF: 1,
				maxBOF: 1,
			}],
			"@stylistic/no-tabs": "off",
			"@stylistic/operator-linebreak": ["warn", "after"],
			"@stylistic/padded-blocks": "off",
			"@stylistic/quote-props": ["warn", "consistent-as-needed"],
			"@stylistic/quotes": [
				"warn",
				"double",
				{
					allowTemplateLiterals: true,
					avoidEscape: true,
				},
			],
			"@stylistic/semi": ["warn", "always"],
			"@stylistic/space-before-function-paren": [
				"warn",
				{
					anonymous: "never",
					asyncArrow: "always",
					named: "never",
					catch: "never",
				},
			],
			"@stylistic/spaced-comment": "off",
			"@stylistic/type-annotation-spacing": [
				"warn",
				{
					after: true,
					before: false,
					overrides: {
						arrow: {
							before: true,
						},
					},
				},
			],
			"@stylistic/wrap-iife": ["warn", "inside"],
			"@stylistic/yield-star-spacing": ["warn", {
				before: false,
				after: true,
			}],
		},
	},
] as Config[];
