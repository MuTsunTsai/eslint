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
