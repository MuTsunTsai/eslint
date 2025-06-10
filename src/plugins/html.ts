import pluginHtml from "eslint-plugin-html";

import type { ConfigOptions } from "options";
import type { Config } from "@eslint/config-helpers";
import type { Linter } from "eslint";

export const HTML = "**/*.{htm,html}";

export function addHtml(result: Config[], options: ConfigOptions): void {
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
}
