import { defineConfig } from "@rslib/core";

export default defineConfig({
	lib: [
		{
			format: "esm",
			syntax: "es2024",
			dts: {
				bundle: true, // Requires @microsoft/api-extractor
			},
		},
		{
			format: "cjs",
			syntax: "es2024",
		},
	],
	output: {
		target: "node",
	},
});
