import pluginStyle from "@stylistic/eslint-plugin";

import { errorToWarn } from "../utils";

import type { Config } from "@eslint/config-helpers";
import type { Rule } from "eslint";
import type { Class } from "estree";

type ClassNode = Class & {
	implements?: Class["superClass"][];
};

type ClassListener = (node: ClassNode & Rule.NodeParentExtension) => void;

/**
 * Patches `@stylistic/indent` so that a class with only an `implements` clause
 * is indented the same way as a class with an `extends` clause.
 *
 * The original rule only checks the heritage indentation when `superClass`
 * exists, so it requires `implements` on a new line to have no indentation.
 * We work around that by treating the first `implements` item as the
 * `superClass`, since the rule only uses it to locate the preceding keyword.
 *
 * As of `@stylistic/eslint-plugin` v5.10.0, this is still not supported
 * upstream, and there is no option for it either. This patch relies on the
 * internal implementation of the rule (`checkHeritages`), so it should be
 * re-checked when upgrading, and removed once upstream supports it.
 */
function patchIndent(): void {
	type Rules = Record<string, Rule.RuleModule>;
	const rules = pluginStyle.rules as unknown as Rules;
	const indent = rules.indent!;
	rules.indent = {
		...indent,
		create(context) {
			const listeners = indent.create(context);
			for(const type of ["ClassDeclaration", "ClassExpression"] as const) {
				const listener = listeners[type] as ClassListener | undefined;
				if(!listener) continue;
				const patched: ClassListener =
					node => listener(withImplements(node));
				listeners[type] = patched;
			}
			return listeners;
		},
	};
}

function withImplements<T extends ClassNode>(node: T): T {
	if(node.superClass || !node.implements?.length) return node;
	return Object.create(node, {
		superClass: { value: node.implements[0] },
	}) as T;
}

patchIndent();

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
			"@stylistic/arrow-spacing": [
				"warn",
				{
					before: true,
					after: true,
				},
			],
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
						switch: { after: false },
					},
				},
			],
			"@stylistic/lines-between-class-members": "off",
			"@stylistic/max-len": [
				"warn",
				{
					code: 80,
					ignoreUrls: true,
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
					allowTemplateLiterals: "always",
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
						arrow: "ignore",
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
