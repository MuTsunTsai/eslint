import pluginPackageJson from "eslint-plugin-package-json";
import { sortOrder } from "sort-package-json";

import { errorToWarn } from "utils";

import type { ConfigOptions } from "options";
import type { Config } from "@eslint/config-helpers";

export function addPackageJson(result: Config[], options: ConfigOptions): void {
	result.push(
		errorToWarn(pluginPackageJson.configs.recommended),
		{
			name: "Package.json override",
			files: ["**/package.json"],
			rules: {
				"max-lines": "off",
				"package-json/require-author": "warn",
				"@stylistic/comma-dangle": "off",
				"@stylistic/eol-last": "off",
				"@stylistic/quote-props": "off",
				"@stylistic/semi": "off",
				...(options.package ? {
					"package-json/order-properties": [
						"warn", {
							order: Array.isArray(options.package) ? options.package : options.package(sortOrder),
						},
					],
				} : {}),
			},
		}
	);
}
