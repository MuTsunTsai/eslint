import type { ESLint, Rule } from "eslint";
import type { DoWhileStatement, ForInStatement, ForOfStatement, IfStatement, SourceLocation, WhileStatement } from "estree";

export default {
	rules: {
		"ascii-comments": {
			meta: {
				type: "layout",
				docs: {
					description: "Comments should use ASCII characters only.",
				},
			},
			create(context: Rule.RuleContext): Rule.NodeListener {
				const sourceCode = context.sourceCode;
				return {
					Program(): void {
						for(const comment of sourceCode.getAllComments()) {
							const match = (/[^\s!-~]+/m).exec(comment.value);
							if(match) {
								const start = comment.range![0];
								context.report({
									loc: {
										start: sourceCode.getLocFromIndex(start + 2 + match.index),
										end: sourceCode.getLocFromIndex(start + 2 + match.index + match[0].length),
									},
									message: "Comments should use ASCII characters only.",
								});
							}
						}
					},
				};
			},
		},
		"single-line-control-statement-spacing": {
			meta: {
				type: "layout",
				docs: {
					description: "Enforces consistent spacing in single-line control statements.",
				},
				fixable: "whitespace",
			},
			create(context: Rule.RuleContext): Rule.RuleListener {
				const sourceCode = context.sourceCode;

				type Node = Rule.Node & (
					IfStatement |
					DoWhileStatement | WhileStatement |
					ForInStatement | ForOfStatement | ForOfStatement
				) & {
					loc: SourceLocation;
				};

				function checkSpaceAfter<T extends Node>(node: T): void {
					if(!node) return;
					if(node.loc.start.line !== node.loc.end.line) return; // Not single-line
					const body = "consequent" in node ? node.consequent : node.body;
					const token = sourceCode.getFirstToken(body)!;
					const prev = sourceCode.getTokenBefore(token)!;
					const start = prev.range[1];
					const end = token.range[0];
					if(start === end) {
						context.report({
							loc: {
								start: sourceCode.getLocFromIndex(start),
								end: sourceCode.getLocFromIndex(end),
							},
							message: "There should be a single space after control statements.",
							fix(fixer) {
								return fixer.replaceTextRange([start, end], " ");
							},
						});
					}
				}

				return {
					IfStatement: checkSpaceAfter,
					DoWhileStatement: checkSpaceAfter,
					ForInStatement: checkSpaceAfter,
					ForOfStatement: checkSpaceAfter,
					ForStatement: checkSpaceAfter,
					WhileStatement: checkSpaceAfter,
				} as Rule.NodeListener;
			},
		},
	},
} as ESLint.Plugin;
