import { defineConfig } from "@rstest/core";

export default defineConfig({
	include: ["test/specs/**/*.spec.ts"],
	source: {
		tsconfigPath: "test/tsconfig.json",
	},
});
