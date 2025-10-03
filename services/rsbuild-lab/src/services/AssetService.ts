import {Effect, Stream} from "effect";
import {SequenceService} from "./SequenceService.js";

interface AssetMetadata {
	readonly url: string;
	readonly type: "model" | "texture" | "audio";
	readonly priority: "critical" | "enhancement";
}

const criticalAssets: AssetMetadata[] = [
	{url: "bedroom-corner.glb", type: "model", priority: "critical"},
	{url: "nightstand.glb", type: "model", priority: "critical"},
	{url: "glasses.glb", type: "model", priority: "critical"},
	{url: "phone.glb", type: "model", priority: "critical"},
];

const audioAssets: AssetMetadata[] = [
	{url: "morning-ambient.wav", type: "audio", priority: "enhancement"},
	{url: "interaction-feedback.wav", type: "audio", priority: "enhancement"},
	{url: "glasses-pickup.wav", type: "audio", priority: "enhancement"},
];

export class AssetService extends Effect.Service<AssetService>()("AssetService", {
	effect: Effect.gen(function* () {
		const loadAsset = (asset: AssetMetadata) =>
			Effect.gen(function* () {
				yield* Effect.log(`Loading asset: ${asset.url}`);

				// Simulate asset loading with a delay
				yield* Effect.sleep("100 millis");

				// Mock loaded asset
				return {
					url: asset.url,
					type: asset.type,
					data: `mock-${asset.type}-data`,
					loaded: true,
				};
			});

		const loadCriticalAssets = Stream.fromIterable(criticalAssets).pipe(
			Stream.mapEffect(loadAsset),
			Stream.runCollect,
		);

		const loadAudioAssets = Stream.fromIterable(audioAssets).pipe(
			Stream.mapEffect(loadAsset),
			Stream.runCollect,
		);

		const loadDetailTextures = Effect.gen(function* () {
			yield* Effect.log("Loading detail textures...");
			yield* Effect.sleep("50 millis");
			return [];
		});

		// Progressive loading strategy with progress updates
		const loadSequentially = Effect.gen(function* () {
			yield* Effect.log("Starting asset loading...");
			const sequenceService = yield* SequenceService;

			// Update progress to show loading started
			yield* updateProgress(sequenceService, 0.1);

			// Critical path first (60% of progress)
			const criticalResults = yield* loadCriticalAssets;
			yield* Effect.log(`Loaded ${criticalResults.length} critical assets`);
			yield* updateProgress(sequenceService, 0.6);

			// Mark sequence as ready
			yield* sequenceService.setReady(true);

			// Enhancement assets after (80% of progress)
			const audioResults = yield* loadAudioAssets;
			yield* Effect.log(`Loaded ${audioResults.length} audio assets`);
			yield* updateProgress(sequenceService, 0.8);

			// Detail textures (100% of progress)
			yield* loadDetailTextures;
			yield* updateProgress(sequenceService, 1.0);
			yield* Effect.log("All assets loaded successfully");

			return {criticalResults, audioResults};
		});

		const updateProgress = (sequenceService: SequenceService, progress: number) =>
			sequenceService.setProgress(progress);

		const switchToLowResTextures = Effect.gen(function* () {
			yield* Effect.log("Switching to low resolution textures for performance");
		});

		return {
			loadSequentially,
			loadAsset,
			switchToLowResTextures,
		} as const;
	}),
}) {}
