import {factory} from "@usirin/forge";
import type {Spellbook} from "@usirin/spellbook";
import {createSpellbookStream, type ServerTransport} from "./transport";

/**
 * Options for creating a SpellbookServer
 */
export interface SpellbookServerOptions {
	/**
	 * Transport to use for communication
	 */
	transport: ServerTransport;

	/**
	 * Configuration options
	 */
	config?: {
		/**
		 * Whether to validate parameters (default: true)
		 */
		validateParameters?: boolean;
	};
}

/**
 * Simple function to serve a spellbook on a transport
 *
 * @param spellbook - The spellbook to serve
 * @param transport - The transport to serve on
 * @returns A promise that resolves when the server stops
 */
export function serve<TSpellbook extends Spellbook>(
	spellbook: TSpellbook,
	transport: ServerTransport,
) {
	return transport.incoming
		.pipeThrough(createSpellbookStream(spellbook))
		.pipeTo(transport.outgoing);
}

/**
 * Create a SpellbookServer for a specific spellbook
 *
 * @param spellbook - The spellbook to serve
 * @param options - Server options
 * @returns A SpellbookServer instance
 */
export const createSpellbookServer = factory(
	"server",
	<TSpellbook extends Spellbook>(spellbook: TSpellbook, options: SpellbookServerOptions) => {
		let running = false;
		let _serverPromise: Promise<void> | null = null;

		return {
			start() {
				if (running) return;
				running = true;

				_serverPromise = serve(spellbook, options.transport);
			},

			stop() {
				running = false;
				// No direct way to stop the pipeline, but we mark it as not running
			},

			isRunning() {
				return running;
			},

			getSpellbook() {
				return spellbook;
			},

			getTransport() {
				return options.transport;
			},
		};
	},
);

export type SpellbookServer<TSpellbook extends Spellbook = Spellbook> = ReturnType<
	typeof createSpellbookServer<TSpellbook>
>;
