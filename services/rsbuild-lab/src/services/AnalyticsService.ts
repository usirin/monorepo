import {Effect, Ref} from "effect";
import type {InteractionEvent, SequencePhase} from "../models/SequenceState.js";

interface SessionData {
	readonly sessionId: string;
	readonly startTime: number;
	readonly lastPhaseStart: number;
	readonly phaseTransitions: ReadonlyArray<{
		readonly phase: SequencePhase;
		readonly timestamp: number;
		readonly duration: number;
	}>;
	readonly interactions: ReadonlyArray<InteractionEvent & {timestamp: number}>;
}

const initialSession: SessionData = {
	sessionId: crypto.randomUUID(),
	startTime: Date.now(),
	lastPhaseStart: Date.now(),
	phaseTransitions: [],
	interactions: [],
};

export class AnalyticsService extends Effect.Service<AnalyticsService>()("AnalyticsService", {
	effect: Effect.gen(function* () {
		const sessionData = yield* Ref.make<SessionData>(initialSession);

		const trackPhaseTransition = (phase: SequencePhase) =>
			Effect.gen(function* () {
				const timestamp = Date.now();
				yield* Ref.update(sessionData, (session) => ({
					...session,
					phaseTransitions: [
						...session.phaseTransitions,
						{
							phase,
							timestamp,
							duration: timestamp - session.lastPhaseStart,
						},
					],
					lastPhaseStart: timestamp,
				}));
				yield* Effect.log(`Phase transition: ${phase}`);
			});

		const trackInteraction = (interaction: InteractionEvent) =>
			Effect.gen(function* () {
				yield* Ref.update(sessionData, (session) => ({
					...session,
					interactions: [
						...session.interactions,
						{
							...interaction,
							timestamp: Date.now(),
						},
					],
				}));
				yield* Effect.log(`Interaction tracked: ${interaction.type}`);
			});

		const trackError = (errorType: string, error: unknown) =>
			Effect.gen(function* () {
				yield* Effect.log(`Error tracked: ${errorType}`, error);
				// In a real implementation, this would send to analytics service
			});

		const getCompletionRate = Effect.gen(function* () {
			const session = yield* Ref.get(sessionData);
			return session.phaseTransitions.length >= 4; // All phases completed
		});

		const getSessionData = () => Ref.get(sessionData);

		return {
			trackPhaseTransition,
			trackInteraction,
			trackError,
			getCompletionRate,
			getSessionData,
		} as const;
	}),
}) {}
