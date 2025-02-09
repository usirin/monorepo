import {describe, expect, it} from "bun:test";
import {normalize, parse, parseSequence, stringify} from "./syntax-vim.ts";

describe("stringify()", () => {
	describe("simple", () => {
		it("handles letters", () => {
			expect(stringify({key: "a"})).toBe("a");
			expect(stringify({key: "a", shiftKey: true})).toBe("a");
		});

		it("handles capital letters", () => {
			expect(stringify({key: "A"})).toBe("A");
			expect(stringify({key: "A", shiftKey: true})).toBe("A");
		});

		it("handles symbols", () => {
			expect(stringify({key: "/"})).toBe("/");
			expect(stringify({key: "/", shiftKey: true})).toBe("/");
		});

		it("handles numbers", () => {
			expect(stringify({key: "1"})).toBe("1");
			expect(stringify({key: "1", shiftKey: true})).toBe("1");
		});

		it("handles special keys", () => {
			expect(stringify({key: "Enter"})).toBe("<enter>");
			expect(stringify({key: "Enter", shiftKey: true})).toBe("<s-enter>");
		});

		it("handles aliases", () => {
			expect(stringify({key: "left"})).toBe("<arrowleft>");
			expect(stringify({key: "cr", shiftKey: true})).toBe("<s-enter>");
			expect(stringify({key: "esc"})).toBe("<escape>");
		});
	});

	it("falls back to event.code", () => {
		expect(
			stringify({
				key: "Unidentified",
				code: "Tab",
				shiftKey: true,
			}),
		).toBe("<s-tab>");
	});

	describe("modifiers", () => {
		it("handles letters with modifiers", () => {
			expect(stringify({key: "a", ctrlKey: true})).toBe("<c-a>");
			expect(stringify({key: "a", shiftKey: true, ctrlKey: true})).toBe("<c-a>");
		});

		it("handles capital letters with modifiers", () => {
			expect(stringify({key: "A", ctrlKey: true})).toBe("<c-A>");
			expect(stringify({key: "A", shiftKey: true, ctrlKey: true})).toBe("<c-A>");
		});

		it("handles symbols with modifiers", () => {
			expect(stringify({key: "/", ctrlKey: true})).toBe("<c-/>");
			expect(stringify({key: "/", shiftKey: true, ctrlKey: true})).toBe("<c-/>");
			expect(stringify({key: "-", ctrlKey: true})).toBe("<c-->");
		});

		it("handles numbers with modifiers", () => {
			expect(stringify({key: "1", ctrlKey: true})).toBe("<c-1>");
			expect(stringify({key: "1", shiftKey: true, ctrlKey: true})).toBe("<c-1>");
		});

		it("handles special keys with modifiers", () => {
			expect(stringify({key: "Enter", ctrlKey: true})).toBe("<c-enter>");
			expect(stringify({key: "Enter", shiftKey: true, ctrlKey: true})).toBe("<c-s-enter>");
		});

		it("handles multiple modifiers in alphabetical order", () => {
			expect(
				stringify({key: "a", shiftKey: true, ctrlKey: true, metaKey: true, altKey: true}),
			).toBe("<a-c-m-a>");
			expect(
				stringify({key: "Enter", shiftKey: true, ctrlKey: true, metaKey: true, altKey: true}),
			).toBe("<c-m-s-enter>");
		});
	});

	describe("special cases", () => {
		it("handles space", () => {
			expect(stringify({key: " "})).toBe("<space>");
			expect(stringify({key: " ", shiftKey: true})).toBe("<s-space>");
			expect(stringify({key: " ", shiftKey: true, ctrlKey: true})).toBe("<c-s-space>");
		});

		it("handles < and >", () => {
			expect(stringify({key: "<"})).toBe("<lt>");
			expect(stringify({key: "<", shiftKey: true})).toBe("<lt>");
			expect(stringify({key: "<", shiftKey: true, ctrlKey: true})).toBe("<c-lt>");
			expect(stringify({key: ">"})).toBe("<gt>");
			expect(stringify({key: ">", shiftKey: true})).toBe("<gt>");
			expect(stringify({key: ">", shiftKey: true, ctrlKey: true})).toBe("<c-gt>");
		});

		it("ensures Array#join safety", () => {
			expect(`${stringify({key: "<"})}${stringify({key: "a"})}${stringify({key: ">"})}`).toBe(
				"<lt>a<gt>",
			);
		});
	});

	describe("invalid keys", () => {
		it("handles unrecognized keys", () => {
			expect(stringify({key: "Unidentified"})).toBe("");
			expect(stringify({key: "Process"})).toBe("");
			expect(stringify({key: "Dead"})).toBe("");
		});

		it("handles modifier keys", () => {
			const modifiers = [
				"Alt",
				"Control",
				"Meta",
				"Shift",
				"OS",
				"Hyper",
				"Super",
				"OSLeft",
				"ControlRight",
			];
			for (const modifier of modifiers) {
				expect(stringify({key: modifier})).toBe("");
			}
		});
	});
});

describe("normalize()", () => {
	it("handles single characters", () => {
		expect(normalize("a").value).toBe("a");
		expect(normalize("A").value).toBe("A");
		expect(normalize("/").value).toBe("/");
		expect(normalize("1").value).toBe("1");
	});

	it("handles keys", () => {
		expect(normalize("<a>").value).toBe("a");
		expect(normalize("<A>").value).toBe("A");
		expect(normalize("</>").value).toBe("/");
		expect(normalize("<1>").value).toBe("1");

		expect(normalize("<c-a>").value).toBe("<c-a>");
		expect(normalize("<c-A>").value).toBe("<c-A>");
		expect(normalize("<c-/>").value).toBe("<c-/>");
		expect(normalize("<c-1>").value).toBe("<c-1>");

		expect(normalize("<Escape>").value).toBe("<escape>");
		expect(normalize("<C-ESC>").value).toBe("<c-escape>");
		expect(normalize("<F12>").value).toBe("<f12>");
	});

	it("handles < and >", () => {
		expect(normalize("<").value).toBe("<lt>");
		expect(normalize(">").value).toBe("<gt>");
	});

	it("handles the empty string", () => {
		expect(normalize("").value).toEqual({
			name: "InvalidKeyError",
			key: "",
			message: "Invalid key: ",
		});
	});

	it("handles errors", () => {
		expect(normalize("ab").value).toEqual({
			name: "InvalidKeyError",
			key: "ab",
			message: "Invalid key: ab",
		});
		expect(normalize("<S-gt>").value).toEqual({
			name: "DisallowedModifierError",
			modifier: "S",
			context: "<S-gt>",
			message: "<S-gt>: Unusable modifier with single-character keys: S",
		});
	});
});

describe("parseSequence()", () => {
	it("handles single characters", () => {
		expect(parseSequence("a")).toEqual(["a"]);
		expect(parseSequence("<")).toEqual(["<"]);
		expect(parseSequence(">")).toEqual([">"]);
		expect(parseSequence("/")).toEqual(["/"]);
		expect(parseSequence("1")).toEqual(["1"]);
		expect(parseSequence(" ")).toEqual([" "]);
		expect(parseSequence("\t")).toEqual(["\t"]);
		expect(parseSequence("\n")).toEqual(["\n"]);
	});

	it("handles sequence of characters", () => {
		expect(parseSequence("a<>/1 \t\n")).toEqual(["a", "<", ">", "/", "1", " ", "\t", "\n"]);
		expect(parseSequence(">>")).toEqual([">", ">"]);
		expect(parseSequence("<2j")).toEqual(["<", "2", "j"]);
	});

	it("handles single keys", () => {
		expect(parseSequence("<a>")).toEqual(["<a>"]);
		expect(parseSequence("<A>")).toEqual(["<A>"]);
		expect(parseSequence("</>")).toEqual(["</>"]);
		expect(parseSequence("<1>")).toEqual(["<1>"]);
		expect(parseSequence("<Escape>")).toEqual(["<Escape>"]);
		expect(parseSequence("<escApe>")).toEqual(["<escApe>"]);

		expect(parseSequence("<c-a>")).toEqual(["<c-a>"]);
		expect(parseSequence("<c-A>")).toEqual(["<c-A>"]);
		expect(parseSequence("<c-/>")).toEqual(["<c-/>"]);
		expect(parseSequence("<c-1>")).toEqual(["<c-1>"]);
		expect(parseSequence("<c-Escape>")).toEqual(["<c-Escape>"]);
		expect(parseSequence("<c-a-m-Escape>")).toEqual(["<c-a-m-Escape>"]);
		expect(parseSequence("<s-K1>")).toEqual(["<s-K1>"]);
	});

	it("handles invalid single keys", () => {
		expect(parseSequence("<-a>")).toEqual(["<-a>"]);
		expect(parseSequence("<x-esc>")).toEqual(["<x-esc>"]);
		expect(parseSequence("<shift-esc>")).toEqual(["<shift-esc>"]);
		expect(parseSequence("<s-++>")).toEqual(["<s-++>"]);
	});

	it("handles mix of characters and keys", () => {
		expect(parseSequence("a<a><c-a><esc><c-esc>b<Del>")).toEqual([
			"a",
			"<a>",
			"<c-a>",
			"<esc>",
			"<c-esc>",
			"b",
			"<Del>",
		]);

		expect(parseSequence("<c-<>")).toEqual(["<", "c", "-", "<", ">"]);
		expect(parseSequence("<c->>")).toEqual(["<c->", ">"]);
		expect(parseSequence("<c- >")).toEqual(["<", "c", "-", " ", ">"]);
	});

	it("handles empty string", () => {
		expect(parseSequence("")).toEqual([""]);
	});
});

describe("parse()", () => {
	it("handles single characters", () => {
		expect(parse("a").value).toEqual({key: "a"});
		expect(parse("A").value).toEqual({key: "A"});
		expect(parse("/").value).toEqual({key: "/"});
		expect(parse("<").value).toEqual({key: "<"});
		expect(parse(">").value).toEqual({key: ">"});
		expect(parse("1").value).toEqual({key: "1"});
	});

	describe("keys", () => {
		it("handles dash", () => {
			expect(parse("<->").value).toEqual({key: "-"});
			expect(parse("<a-->").value).toEqual({key: "-", altKey: true});
		});

		it("handles < and >", () => {
			expect(parse("<gt>").value).toEqual({key: ">"});
			expect(parse("<less>").value).toEqual({key: "<"});
			expect(parse("<c-lesser>").value).toEqual({key: "<", ctrlKey: true});
		});

		it("preserves case", () => {
			expect(parse("<escape>").value).toEqual({key: "escape"});
			expect(parse("<Escape>").value).toEqual({key: "Escape"});
			expect(parse("<escApe>").value).toEqual({key: "escApe"});
			expect(parse("<f1>").value).toEqual({key: "f1"});
			expect(parse("<F1>").value).toEqual({key: "F1"});
			expect(parse("<A>").value).toEqual({key: "A"});
		});

		it("handles modifiers", () => {
			expect(parse("<c-s-a-m-escape>").value).toEqual({
				key: "escape",
				altKey: true,
				ctrlKey: true,
				metaKey: true,
				shiftKey: true,
			});

			expect(parse("<c-1>").value).toEqual({key: "1", ctrlKey: true});
		});

		it("handles aliases", () => {
			expect(parse("<left>").value).toEqual({key: "ArrowLeft"});
			expect(parse("<c-cr>").value).toEqual({key: "Enter", ctrlKey: true});
		});
	});

	it("handles the empty string", () => {
		expect(parse("").value).toEqual({
			name: "InvalidKeyError",
			key: "",
			message: "Invalid key: ",
		});
	});

	describe("errors", () => {
		it("handles invalid single characters", () => {
			expect(parse(" ").value).toEqual({
				name: "InvalidKeyError",
				key: " ",
				message: "Invalid key:  ",
			});
			expect(parse("\t").value).toEqual({
				name: "InvalidKeyError",
				key: "\t",
				message: "Invalid key: \t",
			});
			expect(parse("\n").value).toEqual({
				name: "InvalidKeyError",
				key: "\n",
				message: "Invalid key: \n",
			});
		});

		it("handles invalid keys", () => {
			expect(parse("<>").value).toEqual({
				name: "InvalidKeyError",
				key: "<>",
				message: "Invalid key: <>",
			});
			expect(parse("<ctrl-a>").value).toEqual({
				name: "InvalidKeyError",
				key: "<ctrl-a>",
				message: "Invalid key: <ctrl-a>",
			});
			expect(parse("ab").value).toEqual({
				name: "InvalidKeyError",
				key: "ab",
				message: "Invalid key: ab",
			});
			expect(parse("<a").value).toEqual({
				name: "InvalidKeyError",
				key: "<a",
				message: "Invalid key: <a",
			});
			expect(parse("<a >").value).toEqual({
				name: "InvalidKeyError",
				key: "<a >",
				message: "Invalid key: <a >",
			});
			expect(parse("<a- >").value).toEqual({
				name: "InvalidKeyError",
				key: "<a- >",
				message: "Invalid key: <a- >",
			});
			expect(parse("<a-++>").value).toEqual({
				name: "InvalidKeyError",
				key: "<a-++>",
				message: "Invalid key: <a-++>",
			});
		});

		it("handles unknown modifiers", () => {
			expect(parse("<x-a>").value).toEqual({
				name: "UnknownModifierError",
				modifier: "x",
				context: "<x-a>",
				message: "<x-a>: Unknown modifier: x",
			});
			expect(parse("<X-a>").value).toEqual({
				name: "UnknownModifierError",
				modifier: "X",
				context: "<X-a>",
				message: "<X-a>: Unknown modifier: X",
			});
			expect(parse("<c-c-a>").value).toEqual({
				name: "DuplicateModifierError",
				modifier: "c",
				context: "<c-c-a>",
				message: "<c-c-a>: Duplicate modifier: c",
			});
			expect(parse("<c-C-a>").value).toEqual({
				name: "DuplicateModifierError",
				modifier: "C",
				context: "<c-C-a>",
				message: "<c-C-a>: Duplicate modifier: C",
			});
			expect(parse("<C-c-a>").value).toEqual({
				name: "DuplicateModifierError",
				modifier: "c",
				context: "<C-c-a>",
				message: "<C-c-a>: Duplicate modifier: c",
			});
			expect(parse("<a-s-C-m-s-esc>").value).toEqual({
				name: "DuplicateModifierError",
				modifier: "s",
				context: "<a-s-C-m-s-esc>",
				message: "<a-s-C-m-s-esc>: Duplicate modifier: s",
			});
			expect(parse("<a-s-C-m-S-esc>").value).toEqual({
				name: "DuplicateModifierError",
				modifier: "S",
				context: "<a-s-C-m-S-esc>",
				message: "<a-s-C-m-S-esc>: Duplicate modifier: S",
			});
		});

		it("handles disallowed modifiers", () => {
			expect(parse("<s-a>").value).toEqual({
				name: "DisallowedModifierError",
				modifier: "s",
				context: "<s-a>",
				message: "<s-a>: Unusable modifier with single-character keys: s",
			});
			expect(parse("<c-S-/>").value).toEqual({
				name: "DisallowedModifierError",
				modifier: "S",
				context: "<c-S-/>",
				message: "<c-S-/>: Unusable modifier with single-character keys: S",
			});
			expect(parse("<s-lt>").value).toEqual({
				name: "DisallowedModifierError",
				modifier: "s",
				context: "<s-lt>",
				message: "<s-lt>: Unusable modifier with single-character keys: s",
			});
			expect(parse("<S-greater>").value).toEqual({
				name: "DisallowedModifierError",
				modifier: "S",
				context: "<S-greater>",
				message: "<S-greater>: Unusable modifier with single-character keys: S",
			});
		});
	});
});
