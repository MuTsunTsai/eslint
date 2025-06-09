import type { Linter } from "eslint";

export interface ConfigOptions {
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
	 * The property order to use for `eslint-plugin-package-json`,
	 * or a factory function that modifies the default ordering list.
	 */
	package?: string[] | ((order: string[]) => string[]);

	/**
	 * Whether to use `eslint-plugin-html`
	 * @default true
	 */
	html?: boolean | Partial<Linter.RulesRecord>;
}
