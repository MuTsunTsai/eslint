import pluginTs from "typescript-eslint";

import { VUE } from "./vue";

import type { ConfigOptions } from "options";
import type { Config } from "@eslint/config-helpers";

export const TS = "**/*.{ts,tsx,mts,cts}";

export function addTypeScript(result: Config[], options: ConfigOptions): void {
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
}
