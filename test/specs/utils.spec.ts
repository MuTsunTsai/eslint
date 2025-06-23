import { expect } from "chai";

import { extensionPartToRegExp, restrictGlobsToExtensions, restrictGlobToExtension } from "utils";

describe("Utility", function() {

	it("Converts extension to RegExp", function() {
		expect(extensionPartToRegExp("*")).to.eql(/\.[^\\/]*$/);
		expect(extensionPartToRegExp("?s")).to.eql(/\.[^\\/]s$/);
		expect(extensionPartToRegExp("*ts*")).to.eql(/\.[^\\/]*ts[^\\/]*$/);
		expect(extensionPartToRegExp("?u?")).to.eql(/\.[^\\/]u[^\\/]$/);
	});

	it("Restricts glob to extension", function() {
		expect(restrictGlobToExtension("src/ab", ".ts") === null).to.be.true;
		expect(restrictGlobToExtension("src/ab**", ".ts")).to.equal("src/ab**.ts");
		expect(restrictGlobToExtension("src\\**", ".ts")).to.equal("src\\**\\*.ts");
		expect(restrictGlobToExtension("src/**", ".ts")).to.equal("src/**/*.ts");
		expect(restrictGlobToExtension("src/**/*", ".ts")).to.equal("src/**/*.ts");
		expect(restrictGlobToExtension("src/**/*.*", ".ts")).to.equal("src/**/*.ts");
		expect(restrictGlobToExtension("src/**/*.?a", ".ts")).to.equal(null);
		expect(restrictGlobToExtension("src/**/*.*s", ".ts")).to.equal("src/**/*.ts");
		expect(restrictGlobToExtension("src/**/*.t*", ".ts")).to.equal("src/**/*.ts");
		expect(restrictGlobToExtension("src/**/*.?u?", ".vue")).to.equal("src/**/*.vue");
		expect(restrictGlobToExtension("src/**/*.*u*", ".ts")).to.equal(null);
		expect(restrictGlobToExtension("src/**/*.vue", ".ts")).to.equal(null);
		expect(restrictGlobToExtension("src/**/n?me.*", ".ts")).to.equal("src/**/n?me.ts");
		expect(restrictGlobToExtension("src/**/n*me*", ".ts")).to.equal("src/**/n*me*.ts");
	});

	it("Restricts globs to extensions", function() {
		expect(restrictGlobsToExtensions(["src/**/*.{ts,vue}", "test/**"], [".ts", ".vue"]))
			.to.eql(["src/**/*.ts", "src/**/*.vue", "test/**/*.ts", "test/**/*.vue"]);
	});

});
