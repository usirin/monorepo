import {Effect} from "effect";
import {InteractionType, SequencePhase} from "../models/InteractionTypes.js";
import {AudioService} from "./AudioService.js";
import {SequenceService} from "./SequenceService.js";

const REACH_THRESHOLD = 50; // pixels

export class InteractionService extends Effect.Service<InteractionService>()("InteractionService", {
	effect: Effect.gen(function* () {
		const handleMouseMove = (event: MouseEvent) =>
			Effect.gen(function* () {
				const sequenceService = yield* SequenceService;
				const state = yield* sequenceService.getState();

				switch (state.phase) {
					case SequencePhase.REACHING:
						return yield* handleGlassesReach(event);
					case SequencePhase.AWARENESS:
						return yield* handleChoiceHover(event);
					default:
						return Effect.void;
				}
			});

		const handleGlassesReach = (event: MouseEvent) =>
			Effect.gen(function* () {
				const glassesPosition = yield* getGlassesScreenPosition();
				const mouseDistance = calculateDistance(event, glassesPosition);

				if (mouseDistance < REACH_THRESHOLD) {
					const sequenceService = yield* SequenceService;
					yield* sequenceService.setGlassesReached(true);
					const audioService = yield* AudioService;
					yield* audioService.playSubtleReachFeedback();
					yield* updateHandPosition(event);
				}
			});

		const handleChoiceHover = (_event: MouseEvent) =>
			Effect.gen(function* () {
				// Handle hovering over choices in awareness phase
				const audioService = yield* AudioService;
				yield* audioService.playInteractionFeedback(InteractionType.CHOICE_HOVER);
			});

		const handleGlassesClick = () =>
			Effect.gen(function* () {
				const sequenceService = yield* SequenceService;
				yield* sequenceService.updatePhase(SequencePhase.CLARITY);
				const audioService = yield* AudioService;
				yield* audioService.playInteractionFeedback(InteractionType.GLASSES_CLICK);
			});

		return {
			handleMouseMove,
			handleClick: handleGlassesClick,
			handleGlassesReach,
			handleChoiceHover,
		} as const;
	}),
}) {}

// Helper functions
const getGlassesScreenPosition = () => Effect.sync(() => ({x: 100, y: 100})); // Mock position

const calculateDistance = (event: MouseEvent, position: {x: number; y: number}) =>
	Math.sqrt(Math.pow(event.clientX - position.x, 2) + Math.pow(event.clientY - position.y, 2));

const updateHandPosition = (event: MouseEvent) =>
	Effect.sync(() => {
		// Update 3D hand position based on mouse movement
		console.log(`Hand moved to: ${event.clientX}, ${event.clientY}`);
	});
