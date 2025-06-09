import { FlatCompat } from "@eslint/eslintrc";
import { fixupPluginRules } from "@eslint/compat";
import fs from "node:fs";
import path from "node:path";
import globals from "globals";
import pluginHtml from "eslint-plugin-html";
import pluginImport from "eslint-plugin-import";
import pluginJs from "@eslint/js";
import pluginTs from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import pluginPackageJson from "eslint-plugin-package-json";

import stylistic from "./stylistic";
import localRules from "./local-rules";
import general from "./general";

import type { Linter } from "eslint";
import type { Config } from "@eslint/config-helpers";
import type { FixupPluginDefinition } from "@eslint/compat";

const compat = new FlatCompat();

export { stylistic, localRules, general };

export function legacyPlugin(name: string, alias: string = name): FixupPluginDefinition {
	const plugin = compat.plugins(name)[0]?.plugins?.[alias];
	if(!plugin) throw new Error(`Unable to resolve plugin ${name} and/or alias ${alias}`);
	return fixupPluginRules(plugin);
}

interface ConfigOptions {
	/** Add global ignore globs. */
	ignores?: string[];

	/** The globs to apply global declarations from `globals`. */
	globals?: {
		cjs?: string[];
		esm?: string[];
		browser?: string[];
	};

	/**
	 * Whether to use `typescript-eslint`
	 * @default "auto"
	 */
	typescript?: boolean | "auto";

	/**
	 * Whether to use `eslint-plugin-vue`
	 * @default "auto"
	 */
	vue?: boolean | "auto";

	/** What files to use `eslint-plugin-import`, or detailed settings. */
	import?: string[] | {
		/** What files to use `eslint-plugin-import` */
		files: string[];

		/** Paths to the tsconfig.json files (or the folder). */
		project?: string[];

		/** Additional modules to ignore (other than the known ones). */
		ignore?: string[];
	};

	/**
	 * Whether to use `eslint-plugin-html`
	 * @default true
	 */
	html?: boolean | Partial<Linter.RulesRecord>;
}

const TS = "**/*.{ts,tsx,mts,cts}";
const VUE = "**/*.vue";
const HTML = "**/*.{htm,html}";

export function createConfig(options: ConfigOptions): Config[] {
	const result: Config[] = [];

	options.typescript ??= "auto";
	options.vue ??= "auto";
	options.html ??= true;

	const tsAuto = options.typescript == "auto";
	const vueAuto = options.vue == "auto";
	if(tsAuto || vueAuto) {
		const packagePath = path.join(process.cwd(), "package.json");
		const file = fs.readFileSync(packagePath, "utf-8");
		const json = JSON.parse(file);

		function has(name: string): boolean {
			return name in json.dependencies || name in json.devDependencies;
		}

		if(tsAuto) options.typescript = has("typescript") || fs.existsSync("tsconfig.json");
		if(vueAuto) options.vue = has("vue");
	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////
	// Base
	/////////////////////////////////////////////////////////////////////////////////////////////////////

	if(options.ignores) {
		result.push({
			name: "Global ignores",
			ignores: options.ignores,
		});
	}

	const includes: string[] = [];
	if(options.typescript) includes.push(TS);
	if(options.vue) includes.push(VUE);
	if(options.html) includes.push(HTML);
	if(includes.length) {
		result.push({
			name: "Global includes",
			files: includes,
		});
	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////
	// General
	/////////////////////////////////////////////////////////////////////////////////////////////////////

	result.push(
		{
			name: "Default",
			...pluginJs.configs.recommended,
		},
		...stylistic,
		general,
		{
			name: "Local rules",
			plugins: {
				"local-rules": localRules,
			},
			rules: {
				"local-rules/ascii-comments": "error",
				"local-rules/single-line-control-statement-spacing": "warn",
			},
		}
	);

	/////////////////////////////////////////////////////////////////////////////////////////////////////
	// TypeScript
	/////////////////////////////////////////////////////////////////////////////////////////////////////

	if(options.typescript) {
		const files = [TS];
		if(options.vue) files.push(VUE);
		result.push(
			...(pluginTs.configs.recommended as Config[]).map(config => ({
				...config,
				files,
			})),
			{
				name: "General:TypeScript",
				files,
				rules: {
					"@typescript-eslint/ban-ts-comment": "off",
					"@typescript-eslint/class-methods-use-this": ["warn", {
						ignoreOverrideMethods: true,
						ignoreClassesThatImplementAnInterface: "public-fields",
					}],
					"@typescript-eslint/no-empty-function": "warn",
					"@typescript-eslint/no-empty-object-type": ["warn", { allowInterfaces: "always" }],
					"@typescript-eslint/no-explicit-any": ["warn", { ignoreRestArgs: true }],
					"@typescript-eslint/no-invalid-this": "error",
					"@typescript-eslint/no-loop-func": "warn",
					"@typescript-eslint/no-magic-numbers": ["warn", {
						ignore: [-1, 0, 1, 2],
						ignoreArrayIndexes: true,
						ignoreDefaultValues: true,
						ignoreEnums: true,
						ignoreNumericLiteralTypes: true,
						ignoreReadonlyClassProperties: true,
					}],
					"@typescript-eslint/no-namespace": "off",
					"@typescript-eslint/no-shadow": "warn",
					"@typescript-eslint/no-this-alias": ["warn", {
						allowDestructuring: true,
						allowedNames: ["cursor"],
					}],
					"@typescript-eslint/no-unsafe-declaration-merging": "off",
					"@typescript-eslint/no-unused-expressions": "warn",
					"@typescript-eslint/no-unused-vars": "off",
					"@typescript-eslint/no-useless-constructor": ["warn"],
					"@typescript-eslint/triple-slash-reference": "off",
					"no-empty-function": "off",
					"no-invalid-this": "off",
					"no-loop-func": "off",
					"no-shadow": "off",
					"no-undef": "off", // This is redundant as TypeScript catches things that are really undefined
				},
			}
		);
	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////
	// Package.json
	/////////////////////////////////////////////////////////////////////////////////////////////////////

	result.push(
		pluginPackageJson.configs.recommended,
		{
			name: "Package.json files",
			files: ["**/package.json"],
			rules: {
				"@stylistic/comma-dangle": "off",
				"@stylistic/eol-last": "off",
				"@stylistic/quote-props": "off",
				"@stylistic/semi": "off",
			},
		}
	);

	/////////////////////////////////////////////////////////////////////////////////////////////////////
	// Import
	/////////////////////////////////////////////////////////////////////////////////////////////////////

	if(options.import) {
		// Downward compatibility
		if(Array.isArray(options.import)) options.import = { files: options.import };

		const ts = pluginImport.flatConfigs.typescript;
		result.push(
			{
				name: "Plugin:import",
				files: options.import.files,
				plugins: {
					import: pluginImport,
				},
				rules: {
					...(options.typescript ? {
						...ts.rules,
						"@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],
					} : {}),
					"import/consistent-type-specifier-style": ["warn", "prefer-top-level"],
					"import/newline-after-import": "warn",
					"import/no-cycle": ["warn", { ignoreExternal: true }],
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
			}
		);
	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////
	// Vue
	/////////////////////////////////////////////////////////////////////////////////////////////////////

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
				settings: options.import ? {
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

	/////////////////////////////////////////////////////////////////////////////////////////////////////
	// HTML
	/////////////////////////////////////////////////////////////////////////////////////////////////////

	if(options.html) {
		const rules: Partial<Linter.RulesRecord> = {
			// Typical GA codes will trigger these two,
			// so we add them as default rules.
			"no-undef": "off",
			"prefer-rest-params": "off",
		};
		if(typeof options.html == "object") {
			Object.assign(rules, options.html);
		}
		result.push({
			name: "General:HTML",
			files: [HTML],
			plugins: {
				html: pluginHtml,
			},
			rules,
		});
	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////
	// Globals
	/////////////////////////////////////////////////////////////////////////////////////////////////////

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

	/////////////////////////////////////////////////////////////////////////////////////////////////////
	// Other
	/////////////////////////////////////////////////////////////////////////////////////////////////////

	result.push(
		{
			name: "ESLint",
			files: ["eslint.config.mjs"],
			rules: {
				...(options.typescript ? {
					"@typescript-eslint/no-magic-numbers": "off",
				} : {}),
				...(options.import ? {
					"import/no-unresolved": "off",
				} : {}),
				"sort-keys": ["warn", "asc", { minKeys: 6 }],
			},
		},
		{
			name: "Config files",
			files: ["**/*.config.{js,ts,mjs}"],
			rules: {
				// Config files can often be very long, with a big `defineConfig()` function.
				"max-lines-per-function": "off",
				"max-lines": "off",
			},
		}
	);

	return result;
}
