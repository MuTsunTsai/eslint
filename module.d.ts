// https://stackoverflow.com/questions/39040108/import-class-in-definition-file-d-ts

declare module "eslint-plugin-html" {
	import type { ESLint } from "eslint";

	const plugin: ESLint.Plugin;
	export default plugin;
}

declare module "eslint-plugin-import" {
	import type { ESLint } from "eslint";
	import type { Config } from "@eslint/config-helpers";

	const plugin: ESLint.Plugin & {
		flatConfigs: {
			typescript: Config;
		};
	};
	export default plugin;
}
