
# @mutsuntsai/eslint

This is the [ESLint](https://eslint.org/) config used in [my](https://github.com/MuTsunTsai) projects.
It is a flat config factory that bundles a curated set of rules and plugins,
so that each project only needs to describe its file layout.

What you get:

- `@eslint/js` recommended rules, plus a set of [general rules](src/plugins/general.ts).
- [`@stylistic/eslint-plugin`](https://eslint.style/) for formatting: tabs, double quotes, semicolons, no space after `if`/`for`/`while`/`switch`, etc.
- [`typescript-eslint`](https://typescript-eslint.io/) for TypeScript (auto-detected).
- [`eslint-plugin-vue`](https://eslint.vuejs.org/) for Vue SFCs (auto-detected).
- [`eslint-plugin-html`](https://github.com/BenoitZugmeyer/eslint-plugin-html) for inline scripts in HTML files.
- [`eslint-plugin-package-json`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json) for `package.json` files.
- [`eslint-plugin-import`](https://github.com/import-js/eslint-plugin-import) for import ordering, cycles and resolution (opt-in).
- Test plugins for [Mocha](https://github.com/lo1tuma/eslint-plugin-mocha), [Rstest](https://rstest.rs/) (via [`@vitest/eslint-plugin`](https://github.com/vitest-dev/eslint-plugin-vitest)) and [Playwright](https://github.com/playwright-community/eslint-plugin-playwright) (opt-in).
- Global declarations from [`globals`](https://github.com/sindresorhus/globals) for Node and browser files.

Most stylistic rules are reported as warnings and are auto-fixable,
so the intended workflow is to let your editor fix them on save.

## Installation

```bash
pnpm add -D eslint @mutsuntsai/eslint
```

ESLint 10 is required as a peer dependency.
All plugins are dependencies of this package, so you don't need to install them separately.

### Notes for pnpm

- `eslint-import-resolver-typescript` depends on `unrs-resolver`, which has a postinstall script.
  It works fine without running it, so you can deny it in `pnpm-workspace.yaml`:

  ```yaml
  allowBuilds:
    unrs-resolver: false
  ```

- Some plugins have not declared support for ESLint 10 in their peer dependencies yet.
  If pnpm warns about that, you can silence it with:

  ```yaml
  peerDependencyRules:
    allowAny:
      - eslint
  ```

## Usage

Create `eslint.config.js` at the project root:

```js
import { defineConfig } from "eslint/config";
import { createConfig } from "@mutsuntsai/eslint";

export default defineConfig([
	...createConfig({
		ignores: ["dist/**"],
	}),
]);
```

Then add a script to `package.json`:

```json
{
	"scripts": {
		"lint": "eslint ."
	}
}
```

`createConfig()` returns an array of flat config objects,
so you can append your own config objects after it to extend or override anything.

### A typical web app (Vue + TypeScript)

```js
import { defineConfig } from "eslint/config";
import { createConfig } from "@mutsuntsai/eslint";

export default defineConfig([
	...createConfig({
		ignores: ["dist/**"],
		import: {
			files: ["**/*.{ts,vue}", "eslint.config.js"],
			project: ["src/app"], // folders containing tsconfig.json
		},
		globals: {
			esm: ["eslint.config.js", "scripts/**"],
			browser: ["src/**"],
		},
	}),

	// Project-specific overrides
	{
		files: ["src/**/*.{ts,vue}"],
		rules: {
			"@typescript-eslint/explicit-function-return-type": ["warn", {
				allowExpressions: true,
			}],
		},
	},
]);
```

### A Node.js package with tests

```js
import { defineConfig } from "eslint/config";
import { createConfig } from "@mutsuntsai/eslint";

export default defineConfig([
	...createConfig({
		ignores: ["{node_modules,dist,.rslib}/**"],
		import: {
			files: ["**/*.ts", "eslint.config.js"],
			project: ["."],
		},
		globals: {
			esm: ["**/*.ts", "./*.js"],
		},
		rstest: ["test/**"],
		playwright: ["e2e/**"],
	}),
]);
```

## Options

All options are optional.

| Option | Type | Default | Description |
|---|---|---|---|
| `ignores` | `string[]` | | Global ignore globs. |
| `typescript` | `boolean \| "auto"` | `"auto"` | Enable `typescript-eslint`. |
| `vue` | `boolean \| "auto"` | `"auto"` | Enable `eslint-plugin-vue`. |
| `html` | `boolean \| RulesRecord` | `true` | Enable `eslint-plugin-html`, optionally with rule overrides. |
| `import` | `string[] \| object` | | Enable `eslint-plugin-import` on the given files. |
| `globals` | `{ cjs?, esm?, browser? }` | | Globs to apply global declarations. |
| `package` | `string[] \| (order) => string[]` | | Custom property order of `package.json`. |
| `nonAsciiComments` | `boolean` | `false` | Allow non-ASCII characters in comments. |
| `mocha` | `string[]` | | Enable `eslint-plugin-mocha` on the given files. |
| `rstest` | `string[] \| object` | | Enable `@vitest/eslint-plugin` for Rstest on the given files. |
| `playwright` | `string[]` | | Enable `eslint-plugin-playwright` on the given files. |

### `ignores`

Global ignore globs, the same as a flat config object with only `ignores`.
Note that ESLint already ignores `node_modules` and `.git` by default.

```js
ignores: ["{build,coverage}/**", "lib/vendor/**/*.js"],
```

### `typescript` and `vue`

With `"auto"`, the plugins are enabled according to the `package.json` in the current working directory:

- TypeScript is enabled if `typescript` is listed in `dependencies` or `devDependencies`, or if `tsconfig.json` exists.
- Vue is enabled if `vue` is listed in `dependencies` or `devDependencies`.

Set them explicitly if the detection doesn't fit your layout
(for example, in a monorepo where `vue` is only a dependency of a sub-package):

```js
vue: true,
```

When TypeScript is enabled, `.vue` files are parsed with the TypeScript parser as well.
Rules such as `no-undef` are turned off for TypeScript files, since the compiler already checks them.

### `html`

Lints inline `<script>` in `*.htm` and `*.html` files.
`no-undef` and `prefer-rest-params` are turned off by default, as typical Google Analytics snippets trigger them.

Pass an object to override more rules, which is useful for legacy inline scripts:

```js
html: {
	"no-var": "off",
	"vars-on-top": "off",
},
```

Pass `false` to disable it.

### `import`

`eslint-plugin-import` is **not** enabled unless you specify the files.
When enabled, it enforces import order (external modules first, then local modules, then type imports, with blank lines between groups),
reports unresolved imports, duplicates and dependency cycles,
and (with TypeScript) prefers `import type` for type-only imports.

```js
// Simple form
import: ["**/*.ts"],

// Detailed form
import: {
	// Files to lint with eslint-plugin-import
	files: ["**/*.{ts,vue}", "eslint.config.js"],
	// Paths to tsconfig.json files (or the folders containing them), for resolving TypeScript paths
	project: ["src/app", "test"],
	// Additional modules that `import/no-unresolved` should ignore
	ignore: ["virtual:.*"],
	// Do not report cycles involving dynamic imports (default: true)
	allowUnsafeDynamicCyclicDependency: true,
},
```

The detailed form is recommended for TypeScript projects,
since `project` is required for the resolver to understand `paths` and `baseUrl` in your tsconfig.

### `globals`

Applies global variable declarations to the matching files:

- `cjs`: Node.js globals, with `sourceType: "commonjs"` (and allows `require()` in TypeScript).
- `esm`: Node.js built-in globals for ES modules, such as build scripts and config files.
- `browser`: browser globals.

```js
globals: {
	esm: ["eslint.config.js", "gulpfile.js", "scripts/**"],
	browser: ["src/**"],
},
```

`.vue` files always get browser globals.

### `package`

`package.json` files are linted with the recommended rules of `eslint-plugin-package-json` (as warnings).
By default, `package-json/order-properties` uses the order of [`sort-package-json`](https://github.com/keithamus/sort-package-json).
You can pass a complete list, or a function that modifies the default list:

```js
// Put a custom "app_version" field right after "version"
package: order => order.toSpliced(order.indexOf("version") + 1, 0, "app_version"),
```

### `nonAsciiComments`

By default, the `local-rules/ascii-comments` rule reports comments containing non-ASCII characters.
Set this to `true` if your project writes comments in languages other than English.

### `mocha`, `rstest` and `playwright`

Enable the corresponding test plugins on the given files.
In all test files, `max-lines-per-function`, `max-classes-per-file`, `no-unused-expressions` (for Chai-style assertions)
and `@typescript-eslint/no-magic-numbers` are turned off.

For Rstest, the rules of `@vitest/eslint-plugin` are applied to imports from `@rstest/core`.
You can register custom assertion helpers so that `vitest/expect-expect` recognizes them:

```js
rstest: {
	files: ["test/**"],
	// Supports wildcards
	assertFunctionNames: ["expect*", "assertValid"],
},
```

## Overriding rules

Append config objects after `createConfig()`:

```js
export default defineConfig([
	...createConfig({ /* ... */ }),
	{
		rules: {
			"@typescript-eslint/no-magic-numbers": "off",
		},
	},
	{
		files: ["**/package.json"],
		rules: {
			"package-json/specify-peers-locally": "off",
		},
	},
]);
```

Some rules you may want to know about:

- `@stylistic/max-len` warns at 80 columns (tab width 4), ignoring strings, URLs and regular expressions. In `.vue` files, `vue/max-len` with 200 columns is used instead.
- `@typescript-eslint/no-magic-numbers` warns on numbers other than `-1`, `0`, `1` and `2`.
- `complexity`, `max-lines`, `max-lines-per-function` and `max-params` use ESLint's defaults (as warnings). `max-lines` and `max-lines-per-function` are turned off for `*.config.{js,ts,mjs}` files.
- In `eslint.config.{js,mjs,ts}`, `sort-keys` requires object keys to be sorted when an object has 6 or more keys, while `@typescript-eslint/no-magic-numbers` and `import/no-unresolved` are turned off.
- `local-rules/single-line-control-statement-spacing` requires a space before the body of a single-line control statement, as in `if(x) return;`.

## Other exports

Besides `createConfig()`, the package also exports:

- `legacyPlugin(name, alias?)`: loads a plugin that only supports the legacy eslintrc format, and wraps it for flat config.

  ```js
  import { legacyPlugin } from "@mutsuntsai/eslint";

  export default defineConfig([
  	{
  		plugins: {
  			"typescript-compat": legacyPlugin("eslint-plugin-typescript-compat", "typescript-compat"),
  		},
  		rules: {
  			"typescript-compat/compat": "error",
  		},
  	},
  ]);
  ```

- `stylistic`, `general`: the stylistic configs and the general rules config, for reuse in other setups.
- `localRules`: the plugin containing the `ascii-comments` and `single-line-control-statement-spacing` rules.

## Editor integration

With the [ESLint extension for VS Code](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint),
add the following to `.vscode/settings.json` to fix warnings on save:

```json
{
	"editor.codeActionsOnSave": {
		"source.fixAll.eslint": "explicit"
	}
}
```

To see which configs and rules apply to each file, run the [config inspector](https://github.com/eslint/config-inspector):

```bash
pnpx @eslint/config-inspector@latest
```
