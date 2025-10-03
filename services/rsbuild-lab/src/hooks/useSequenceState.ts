import {Effect} from "effect";
import {useEffect, useState} from "react";
import type {SequenceState} from "../models/SequenceState.js";
import {SequencePhase} from "../models/SequenceState.js";
import {useRuntime} from "../runtime/RuntimeProvider.js";
import {SequenceService} from "../services/SequenceService.js";

export const useSequenceState = () => {
	const runtime = useRuntime();
	const [state, setState] = useState<SequenceState>({
		phase: SequencePhase.LOADING,
		progress: 0,
		interactions: [],
		audioEnabled: true,
		ready: false,
		performanceMetrics: {
			frameRate: 60,
			loadTime: 0,
			memoryUsage: 0,
		},
		glassesReached: false,
	});

	useEffect(() => {
		let isSubscribed = true;

		const pollState = () => {
			if (!isSubscribed) return;

			const program = Effect.gen(function* () {
				const sequenceService = yield* SequenceService;
				return yield* sequenceService.getState();
			});

			runtime
				.runPromise(program)
				.then((newState) => {
					if (isSubscribed) {
						setState(newState);
					}
				})
				.catch(console.error);
		};

		// Poll every 100ms for state changes
		const interval = setInterval(pollState, 100);

		// Initial poll
		pollState();

		return () => {
			isSubscribed = false;
			clearInterval(interval);
		};
	}, [runtime]);

	return state;
};

export const useSequenceActions = () => {
	const runtime = useRuntime();

	const updatePhase = (phase: SequencePhase) => {
		const program = Effect.gen(function* () {
			const sequenceService = yield* SequenceService;
			yield* sequenceService.updatePhase(phase);
		});

		return runtime.runPromise(program);
	};

	const setGlassesReached = (reached: boolean) => {
		const program = Effect.gen(function* () {
			const sequenceService = yield* SequenceService;
			yield* sequenceService.setGlassesReached(reached);
		});

		return runtime.runPromise(program);
	};

	return {
		updatePhase,
		setGlassesReached,
	};
};
