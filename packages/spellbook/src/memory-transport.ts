import type {Spellbook} from "./spellbook";
import type {SpellSpec, SpellbookRequest, SpellbookResponse, Transport} from "./types";

/**
 * Creates a memory transport that executes spells locally
 */
export function createMemoryTransport<TSpells extends Record<string, SpellSpec>>(
	spellbook: Spellbook,
): Transport<TSpells> {
	const {readable, writable} = new TransformStream<
		SpellbookRequest<TSpells>,
		SpellbookResponse<TSpells>
	>({
		async transform(request, controller) {
			try {
				const result = await spellbook.execute(
					request.spell as string, // keyof TSpells is string | number | symbol, but spellbook.execute expects string
					request.parameters,
				);

				controller.enqueue({
					id: request.id,
					result,
				});
			} catch (error) {
				controller.enqueue({
					id: request.id,
					error: {
						message: error instanceof Error ? error.message : String(error),
						details: error,
					},
				});
			}
		},
	});

	return {
		input: writable,
		output: readable,
	};
}
