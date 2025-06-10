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
		if(!match) {
			return [pattern];
		}

		const [whole, inner] = match;
		const parts = inner.split(",");
		const results: string[] = [];

		for(const part of parts) {
			const replaced = pattern.replace(whole, part);
			results.push(...helper(replaced));
		}
		return results;
	}

	return helper(glob);
}

export function restrictGlobToExtension(glob: string, ext: string): string | null {
	if(!ext.startsWith(".")) {
		throw new Error("Extension must start with a dot, e.g., '.ts'");
	}

	const sep = glob.includes("\\") ? "\\" : "/";
	const parts = glob.split(/[/\\]/);
	const pattern = parts.pop() ?? "";
	const dir = parts.length > 0 ? parts.join(sep) + sep : "";

	if(pattern === "**") return dir + "**" + sep + "*" + ext;
	if(pattern === "*" || pattern === "*.*") {
		return dir + "*" + ext;
	}

	if(pattern.includes(".")) {
		const filenameParts = pattern.split(".");
		const extPart = filenameParts.pop()!;
		if(!new RegExp("\\." + extPart.replace(/\*/g, ".*") + "$").test(ext)) {
			return null;
		}
		return dir + filenameParts.join(".") + ext;
	} else if(pattern.endsWith("*")) {
		return dir + pattern + ext;
	}
	return null;
}

export function restrictGlobsToExtensions(globs: string[], ext: string[]): string[] {
	return globs
		.flatMap(f => expandBraces(f))
		.flatMap(f => ext.map(e => restrictGlobToExtension(f, e)))
		.filter(f => f) as string[];
}
