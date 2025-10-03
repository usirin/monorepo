import {Effect} from "effect";
import {useCallback} from "react";
import type {InteractionEvent} from "../models/InteractionTypes.js";
import {useRuntime} from "../runtime/RuntimeProvider.js";
import {InteractionService} from "../services/InteractionService.js";

export const useInteractions = () => {
	const runtime = useRuntime();

	const handleMouseMove = useCallback(
		(event: MouseEvent) => {
			const program = Effect.gen(function* () {
				const interactionService = yield* InteractionService;
				yield* interactionService.handleMouseMove(event);
			});

			runtime.runPromise(program).catch(console.error);
		},
		[runtime],
	);

	const handleClick = useCallback(() => {
		const program = Effect.gen(function* () {
			const interactionService = yield* InteractionService;
			yield* interactionService.handleClick();
		});

		runtime.runPromise(program).catch(console.error);
	}, [runtime]);

	const trackInteraction = useCallback(
		(interaction: InteractionEvent) => {
			const program = Effect.gen(function* () {
				// In a full implementation, this would be handled by AnalyticsService
				yield* Effect.log(`Interaction: ${interaction.type}`);
			});

			runtime.runPromise(program).catch(console.error);
		},
		[runtime],
	);

	return {
		handleMouseMove,
		handleClick,
		trackInteraction,
	};
};
