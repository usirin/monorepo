import { useState, useCallback, useEffect } from "react";
import { Effect } from "effect";
import type { VoxelData } from "../types";
import { Generators, VoxelServiceLive, VoxelService } from "../services/VoxelService";
import { Gemini } from "../services/Gemini";

// Global store for sharing state between Canvas and Controls
type StoreListener = () => void;

const store = {
	voxels: [] as VoxelData[],
	currentModel: null as string | null,
	isGenerating: false,
	listeners: new Set<StoreListener>(),

	subscribe(listener: StoreListener) {
		store.listeners.add(listener);
		return () => store.listeners.delete(listener);
	},

	notify() {
		store.listeners.forEach(l => l());
	},

	setVoxels(data: VoxelData[]) {
		store.voxels = data;
		store.notify();
	},

	setCurrentModel(model: string | null) {
		store.currentModel = model;
		store.notify();
	},

	setIsGenerating(isGenerating: boolean) {
		store.isGenerating = isGenerating;
		store.notify();
	}
};

export function useVoxelGenerator() {
	// Subscribe to store updates
	const [, forceUpdate] = useState({});
	useEffect(() => {
		const unsubscribe = store.subscribe(() => forceUpdate({}));
		return () => { unsubscribe(); };
	}, []);

	const generate = useCallback((model: keyof typeof Generators) => {
		store.setCurrentModel(model);
		const program = Effect.gen(function* (_) {
			const service = yield* _(VoxelService);
			return yield* _(service.generate(model));
		}).pipe(
			Effect.provide(VoxelServiceLive),
			Effect.provide(Gemini.Default)
		);

		const data = Effect.runSync(program);
		store.setVoxels(data);
	}, []);

	const generateFromPrompt = useCallback(async (prompt: string) => {
		store.setIsGenerating(true);
		store.setCurrentModel(prompt);
		try {
			const program = Effect.gen(function* (_) {
				const service = yield* _(VoxelService);
				return yield* _(service.generateFromPrompt(prompt));
			}).pipe(
				Effect.provide(VoxelServiceLive),
				Effect.provide(Gemini.Default)
			);

			const data = await Effect.runPromise(program);
			store.setVoxels(data);
		} catch (error) {
			console.error("Failed to generate from prompt", error);
		} finally {
			store.setIsGenerating(false);
		}
	}, []);

	return {
		voxels: store.voxels,
		generate,
		generateFromPrompt,
		currentModel: store.currentModel,
		isGenerating: store.isGenerating
	};
}
