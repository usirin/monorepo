import {describe, expect, it} from "bun:test";
import {entity, factory} from "./entity";

describe("entity", () => {
	it("should work", () => {
		const e = entity("test");
		expect(e.id).toStartWith("test:");
		expect(e.tag).toEqual("test");
	});
});

describe("factory", () => {
	it("should work", () => {
		const createTest = factory("test", (a: number) => ({a}));
		const e = createTest(1);
		expect(e.tag).toEqual("test");
		expect(e.a).toEqual(1);
	});
});

describe("createEntityCache", () => {
	it("should work", () => {});
});
