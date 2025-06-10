import { expect } from "chai";

import { expandBraces, restrictGlobsToExtensions, restrictGlobToExtension } from "utils";

describe("Utility", function() {

	it("Expands braces", function() {
		expect(expandBraces("src/{a,b}/**/*.{js,ts}")).to.eql([
			"src/a/**/*.js",
			"src/a/**/*.ts",
			"src/b/**/*.js",
			"src/b/**/*.ts",
		]);
	});

	it("Restricts glob to extension", function() {
		expect(restrictGlobToExtension("src/ab", ".ts") === null).to.be.true;
		expect(restrictGlobToExtension("src\\**", ".ts")).to.equal("src\\**\\*.ts");
		expect(restrictGlobToExtension("src/**", ".ts")).to.equal("src/**/*.ts");
		expect(restrictGlobToExtension("src/**/*", ".ts")).to.equal("src/**/*.ts");
		expect(restrictGlobToExtension("src/**/*.*", ".ts")).to.equal("src/**/*.ts");
		expect(restrictGlobToExtension("src/**/*.*s", ".ts")).to.equal("src/**/*.ts");
		expect(restrictGlobToExtension("src/**/*.t*", ".ts")).to.equal("src/**/*.ts");
		expect(restrictGlobToExtension("src/**/*.*ts*", ".ts")).to.equal("src/**/*.ts");
		expect(restrictGlobToExtension("src/**/*.*u*", ".vue")).to.equal("src/**/*.vue");
		expect(restrictGlobToExtension("src/**/*.*u*", ".ts")).to.equal(null);
		expect(restrictGlobToExtension("src/**/*.vue", ".ts")).to.equal(null);
		expect(restrictGlobToExtension("src/**/n*me.*", ".ts")).to.equal("src/**/n*me.ts");
		expect(restrictGlobToExtension("src/**/n*me*", ".ts")).to.equal("src/**/n*me*.ts");
	});

	it("Restricts globs to extensions", function() {
		expect(restrictGlobsToExtensions(["src/**/*.{ts,vue}", "test/**"], [".ts", ".vue"]))
			.to.eql(["src/**/*.ts", "src/**/*.vue", "test/**/*.ts", "test/**/*.vue"]);
	});

});
