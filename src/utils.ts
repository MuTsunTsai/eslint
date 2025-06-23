import { expand } from "@isaacs/brace-expansion";

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

export function extensionPartToRegExp(extPart: string): RegExp {
	return new RegExp("\\." + extPart.replace(/\?/g, "[^\\\\/]").replace(/\*/g, "[^\\\\/]*") + "$");
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
		if(!extensionPartToRegExp(extPart).test(ext)) {
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
		.flatMap(f => expand(f))
		.flatMap(f => ext.map(e => restrictGlobToExtension(f, e)))
		.filter(f => f) as string[];
}
