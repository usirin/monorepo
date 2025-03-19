import {factory} from "@usirin/forge";
import type {Spellbook} from "@usirin/spellbook";
import {type ClientTransport, createRequest} from "./transport";

/**
 * Options for creating a SpellCaster
 */
export interface SpellCasterOptions {
	/**
	 * Transport to use for communication
	 */
	transport: ClientTransport;
}

/**
 * Type-safe interface for casting spells
 */
export interface SpellCasterSpec<TSpellbook extends Spellbook> {
	/**
	 * Cast a spell using the provided transport
	 *
	 * @param name - The name of the spell to cast
	 * @param parameters - The parameters to pass to the spell
	 * @returns A promise that resolves to the result of the spell
	 */
	cast<TName extends keyof TSpellbook["spells"]>(
		name: TName,
		parameters: Parameters<TSpellbook["spells"][TName]["execute"]>[0],
	): Promise<ReturnType<TSpellbook["spells"][TName]["execute"]>>;

	/**
	 * Get the current transport
	 */
	getTransport(): ClientTransport;
}

/**
 * Create a SpellCaster for a specific spellbook type
 *
 * @param options - SpellCaster options
 * @returns A SpellCaster instance
 */
export const createSpellCaster = factory(
	"caster",
	<TSpellbook extends Spellbook>(options: SpellCasterOptions): SpellCasterSpec<TSpellbook> => ({
		async cast(name, parameters) {
			return cast<TSpellbook>(options.transport, name, parameters);
		},

		getTransport() {
			return options.transport;
		},
	}),
);

export type SpellCaster<TSpellbook extends Spellbook = Spellbook> = ReturnType<
	typeof createSpellCaster<TSpellbook>
>;

export async function cast<
	TSpellbook extends Spellbook,
	TSpellName extends keyof TSpellbook["spells"] = keyof TSpellbook["spells"],
>(
	transport: ClientTransport,
	name: TSpellName,
	parameters: Parameters<TSpellbook["spells"][TSpellName]["execute"]>[0],
): Promise<ReturnType<TSpellbook["spells"][TSpellName]["execute"]>> {
	const writer = transport.outgoing.getWriter();
	const reader = transport.incoming.getReader();
	try {
		await writer.ready;
		await writer.write(createRequest({name: name as string, parameters}));
	} finally {
		writer.releaseLock();
	}

	try {
		const {value: response} = await reader.read();

		if (!response) {
			throw new Error("No response");
		}

		if (response.error) {
			throw new Error(response.error.message);
		}

		return response.result;
	} finally {
		reader.releaseLock();
	}
}
