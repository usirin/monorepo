import {Effect, Ref} from "effect";
import type {InteractionEvent, SequenceState} from "../models/SequenceState.js";
import {SequencePhase} from "../models/SequenceState.js";
import {AnalyticsService} from "./AnalyticsService.js";
import {AudioService} from "./AudioService.js";

const initialState: SequenceState = {
	phase: SequencePhase.LOADING,
	progress: 0,
	interactions: [],
	audioEnabled: true,
	performanceMetrics: {
		frameRate: 60,
		loadTime: 0,
		memoryUsage: 0,
	},
};

export class SequenceService extends Effect.Service<SequenceService>()("SequenceService", {
	effect: Effect.gen(function* () {
		const state = yield* Ref.make<SequenceState>(initialState);

		const updatePhase = (phase: SequencePhase) =>
			Effect.gen(function* () {
				yield* Ref.update(state, (s) => ({...s, phase}));
				const analyticsService = yield* AnalyticsService;
				yield* analyticsService.trackPhaseTransition(phase);
				const audioService = yield* AudioService;
				yield* audioService.updateAmbientForPhase(phase);
			});

		const handleInteraction = (interaction: InteractionEvent) =>
			Effect.gen(function* () {
				const currentState = yield* Ref.get(state);
				const newState = yield* processInteraction(currentState, interaction);
				yield* Ref.set(state, newState);
				const audioService = yield* AudioService;
				yield* audioService.playInteractionFeedback(interaction.type);
			});

		const getState = () => Ref.get(state);

		const setGlassesReached = (reached: boolean) =>
			Ref.update(state, (s) => ({...s, glassesReached: reached}));

		const setReady = (ready: boolean) => Ref.update(state, (s) => ({...s, ready}));

		const setProgress = (progress: number) =>
			Ref.update(state, (s) => ({...s, progress: Math.max(0, Math.min(1, progress))}));

		return {
			state: getState,
			updatePhase,
			handleInteraction,
			getState,
			setGlassesReached,
			setReady,
			setProgress,
		} as const;
	}),
}) {}

// Helper function to process interactions
const processInteraction = (
	currentState: SequenceState,
	interaction: InteractionEvent,
): Effect.Effect<SequenceState> =>
	Effect.succeed({
		...currentState,
		interactions: [...currentState.interactions, interaction],
		progress: Math.min(currentState.progress + 0.25, 1),
	});
