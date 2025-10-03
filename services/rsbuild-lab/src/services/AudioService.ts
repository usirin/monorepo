import {Effect} from "effect";
import {InteractionType} from "../models/InteractionTypes.js";
import type {SequencePhase} from "../models/SequenceState.js";

export class AudioService extends Effect.Service<AudioService>()("AudioService", {
	effect: Effect.gen(function* () {
		const createAudioContext = () =>
			Effect.sync(() => {
				try {
					// Only create AudioContext after user interaction
					if (
						typeof window !== "undefined" &&
						(window.AudioContext || (window as any).webkitAudioContext)
					) {
						return new (window.AudioContext || (window as any).webkitAudioContext)();
					}
					return null;
				} catch {
					// Suppress expected AudioContext warnings in development
					return null;
				}
			});

		const audioContext = yield* createAudioContext();
		const masterGain = audioContext ? yield* Effect.sync(() => audioContext.createGain()) : null;

		const ambientSounds = new Map<SequencePhase, AudioBuffer>();

		const updateAmbientForPhase = (phase: SequencePhase) =>
			Effect.gen(function* () {
				yield* Effect.log(`Updating ambient audio for phase: ${phase}`);

				if (!audioContext) {
					return;
				}

				const buffer = ambientSounds.get(phase);
				if (buffer) {
					yield* fadeOutCurrent();
					yield* fadeInNew(buffer);
				}
			});

		const playInteractionFeedback = (type: InteractionType) =>
			Effect.gen(function* () {
				yield* Effect.log(`Playing interaction feedback: ${type}`);

				if (!audioContext) {
					return;
				}

				switch (type) {
					case InteractionType.GLASSES_REACH:
						return yield* playSubtleReachSound();
					case InteractionType.GLASSES_CLICK:
						return yield* playGlassesActivationSound();
					case InteractionType.CHOICE_HOVER:
						return yield* playChoiceHoverSound();
					default:
						return Effect.void;
				}
			});

		const playSubtleReachFeedback = () =>
			Effect.gen(function* () {
				yield* Effect.log("Playing subtle reach feedback");
				// Mock audio feedback
			});

		const setMasterVolume = (volume: number) =>
			Effect.sync(() => {
				if (masterGain) {
					masterGain.gain.value = Math.max(0, Math.min(1, volume));
				}
			});

		return {
			updateAmbientForPhase,
			playInteractionFeedback,
			playSubtleReachFeedback,
			setMasterVolume,
			audioContext,
			isSupported: audioContext !== null,
		} as const;
	}),
}) {}

// Helper functions for audio operations
const fadeOutCurrent = () =>
	Effect.gen(function* () {
		yield* Effect.log("Fading out current ambient sound");
		// Mock fade out implementation
	});

const fadeInNew = (_buffer: AudioBuffer) =>
	Effect.gen(function* () {
		yield* Effect.log("Fading in new ambient sound");
		// Mock fade in implementation
	});

const playSubtleReachSound = () =>
	Effect.gen(function* () {
		yield* Effect.log("Playing subtle reach sound");
		// Mock reach sound implementation
	});

const playGlassesActivationSound = () =>
	Effect.gen(function* () {
		yield* Effect.log("Playing glasses activation sound");
		// Mock glasses sound implementation
	});

const playChoiceHoverSound = () =>
	Effect.gen(function* () {
		yield* Effect.log("Playing choice hover sound");
		// Mock hover sound implementation
	});
