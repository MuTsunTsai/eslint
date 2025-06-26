import { FlatCompat } from "@eslint/eslintrc";
import { fixupPluginRules } from "@eslint/compat";
import fs from "node:fs";
import path from "node:path";
import pluginJs from "@eslint/js";

import stylistic from "./plugins/stylistic";
import localRules from "./plugins/local-rules";
import general from "./plugins/general";
import { addTests } from "./plugins/tests";
import { addGlobals } from "plugins/globals";
import { addHtml, HTML } from "plugins/html";
import { addVue, VUE } from "plugins/vue";
import { addImport } from "plugins/import";
import { addPackageJson } from "plugins/package";
import { addTypeScript, TS } from "plugins/typescript";

import type { ConfigOptions } from "./options";
import type { Config } from "@eslint/config-helpers";
import type { FixupPluginDefinition } from "@eslint/compat";

const compat = new FlatCompat();

export { stylistic, localRules, general };

export function legacyPlugin(name: string, alias: string = name): FixupPluginDefinition {
	const plugin = compat.plugins(name)[0]?.plugins?.[alias];
	if(!plugin) throw new Error(`Unable to resolve plugin ${name} and/or alias ${alias}`);
	return fixupPluginRules(plugin);
}

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
				"local-rules/ascii-comments": options.nonAsciiComments ? "off" : "error",
				"local-rules/single-line-control-statement-spacing": "warn",
			},
		}
	);

	/////////////////////////////////////////////////////////////////////////////////////////////////////
	// Plugins
	/////////////////////////////////////////////////////////////////////////////////////////////////////

	addTypeScript(result, options);
	addPackageJson(result, options);
	addImport(result, options);
	addVue(result, options);
	addHtml(result, options);
	addGlobals(result, options);
	addTests(result, options);

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
