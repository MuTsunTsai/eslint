/* eslint-disable local-rules/ascii-comments */
import type { Config } from "@eslint/config-helpers";

/**
 * Change the severities of all rules to "warn".
 */
export function errorToWarn(config: Config): Config {
	for(const key in config.rules) {
		const rule = config.rules[key]!;
		if(rule == "error") config.rules[key] = "warn";
		else if(Array.isArray(rule)) rule[0] = "warn";
	}
	return config;
}

/**
 * Expands brace expressions in a glob-like string into all possible combinations.
 *
 * This function looks for brace patterns of the form `{a,b,c}` and generates
 * a list of strings with each option substituted in place. It supports multiple
 * and nested brace expressions.
 *
 * For example:
 *   - `"src/**‌/*.{ts,tsx}"` becomes `["src/**‌/*.ts", "src/**‌/*.tsx"]`
 *   - `"src/{a,b}/**‌/*.{js,ts}"` becomes
 *     ```
 *     [
 *       "src/a/**‌/*.js",
 *       "src/a/**‌/*.ts",
 *       "src/b/**‌/*.js",
 *       "src/b/**‌/*.ts"
 *     ]
 *     ```
 *
 * @param glob - The input string containing brace expressions.
 * @returns An array of strings with all brace expressions expanded.
 */
export function expandBraces(glob: string): string[] {
	const bracePattern = /\{([^{}]+)\}/;

	function helper(pattern: string): string[] {
		const match = bracePattern.exec(pattern);
		if (!match) {
			return [pattern];
		}

		const [whole, inner] = match;
		const parts = inner.split(",");
		const results: string[] = [];

		for (const part of parts) {
			const replaced = pattern.replace(whole, part);
			results.push(...helper(replaced));
		}
		return results;
	}

	return helper(glob);
}
