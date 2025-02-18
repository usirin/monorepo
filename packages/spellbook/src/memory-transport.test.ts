import {describe, expect, it} from "bun:test";
import {z} from "zod";
import {createMemoryTransport} from "./memory-transport";
import {createSpell, createSpellbook} from "./spellbook";
import type {SpellSpec, SpellbookRequest, Transport} from "./types";

describe("memory-transport", () => {
	// Helper to create a test spellbook
	function createTestSpellbook() {
		return createSpellbook({
			greet: createSpell({
				description: "Greet someone",
				parameters: z.object({name: z.string()}),
				execute: async ({name}) => `Hello ${name}!`,
			}),
			error: createSpell({
				description: "Always throws an error",
				parameters: z.object({}),
				execute: async () => {
					throw new Error("Test error");
				},
			}),
		});
	}

	// Helper to send request and get response
	async function sendRequest<TSpells extends Record<string, SpellSpec>>(
		transport: Transport<TSpells>,
		request: SpellbookRequest<TSpells>,
	) {
		const writer = transport.input.getWriter();
		try {
			await writer.write(request);
		} finally {
			writer.releaseLock();
		}

		const reader = transport.output.getReader();
		try {
			const {value} = await reader.read();
			return value;
		} finally {
			reader.releaseLock();
		}
	}

	it("should execute spells and return results", async () => {
		const spellbook = createTestSpellbook();
		const transport = createMemoryTransport(spellbook);

		const response = await sendRequest(transport, {
			id: "test-1",
			spell: "greet",
			parameters: {name: "World"},
		});

		expect(response).toEqual({
			id: "test-1",
			result: "Hello World!",
		});
	});

	it("should handle spell execution errors", async () => {
		const spellbook = createTestSpellbook();
		const transport = createMemoryTransport(spellbook);

		const response = await sendRequest(transport, {
			id: "test-2",
			spell: "error",
			parameters: {},
		});

		expect(response).toEqual({
			id: "test-2",
			error: {
				message: "Test error",
				details: expect.any(Error),
			},
		});
	});

	it("should handle invalid spell names", async () => {
		const spellbook = createTestSpellbook();
		const transport = createMemoryTransport(spellbook);

		const response = await sendRequest(transport, {
			id: "test-3",
			spell: "nonexistent" as any,
			parameters: {},
		});

		expect(response).toEqual({
			id: "test-3",
			error: {
				message: "Spell not found: nonexistent",
				details: expect.any(Error),
			},
		});
	});

	it("should handle invalid parameters", async () => {
		const spellbook = createTestSpellbook();
		const transport = createMemoryTransport(spellbook);

		const response = await sendRequest(transport, {
			id: "test-4",
			spell: "greet",
			parameters: {}, // missing required 'name'
		});

		expect(response).toEqual({
			id: "test-4",
			error: {
				message: expect.stringContaining("required"),
				details: expect.any(Error),
			},
		});
	});

	it("should handle multiple requests in order", async () => {
		const spellbook = createTestSpellbook();
		const transport1 = createMemoryTransport(spellbook);
		const transport2 = createMemoryTransport(spellbook);

		const [response1, response2] = await Promise.all([
			sendRequest(transport1, {
				id: "test-5a",
				spell: "greet",
				parameters: {name: "Alice"},
			}),
			sendRequest(transport2, {
				id: "test-5b",
				spell: "greet",
				parameters: {name: "Bob"},
			}),
		]);

		expect(response1).toEqual({
			id: "test-5a",
			result: "Hello Alice!",
		});

		expect(response2).toEqual({
			id: "test-5b",
			result: "Hello Bob!",
		});
	});
});
