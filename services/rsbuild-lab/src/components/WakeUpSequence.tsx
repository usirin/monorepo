import {Effect} from "effect";
import type React from "react";
import {useEffect} from "react";
import {useSequenceState} from "../hooks/useSequenceState.js";
import {SequencePhase} from "../models/SequenceState.js";
import {useRuntime} from "../runtime/RuntimeProvider.js";
import {AssetService} from "../services/AssetService.js";
import {SequenceService} from "../services/SequenceService.js";
import {BedroomScene} from "./BedroomScene.js";
import {InteractionProvider} from "./InteractionProvider.js";
import {LoadingScreen} from "./LoadingScreen.js";

export const WakeUpSequence: React.FC = () => {
	const runtime = useRuntime();
	const sequenceState = useSequenceState();

	useEffect(() => {
		// Initialize the sequence when component mounts
		const initializeSequence = Effect.gen(function* () {
			yield* Effect.log("Initializing Wake-Up Sequence MVP...");

			// Start asset loading
			const assetService = yield* AssetService;
			yield* assetService.loadSequentially;

			// Begin the awakening phase
			const sequenceService = yield* SequenceService;
			yield* sequenceService.updatePhase(SequencePhase.AWAKENING);

			yield* Effect.log("Wake-Up Sequence initialized successfully");
		});

		// Run the initialization
		runtime.runPromise(initializeSequence).catch(console.error);
	}, [runtime]);

	// Show loading screen during initial phases
	if (sequenceState.phase === SequencePhase.LOADING) {
		return <LoadingScreen progress={sequenceState.progress} />;
	}

	return (
		<InteractionProvider>
			<div style={{width: "100vw", height: "100vh", position: "relative"}}>
				{/* 3D Scene */}
				<BedroomScene phase={sequenceState.phase} />

				{/* Debug info (remove in production) */}
				{process.env.NODE_ENV === "development" && (
					<div
						style={{
							position: "absolute",
							top: 10,
							left: 10,
							background: "rgba(0,0,0,0.7)",
							color: "white",
							padding: "10px",
							borderRadius: "5px",
							fontFamily: "monospace",
							fontSize: "12px",
							zIndex: 1000,
						}}
					>
						<div>Phase: {sequenceState.phase}</div>
						<div>Progress: {Math.round(sequenceState.progress * 100)}%</div>
						<div>Interactions: {sequenceState.interactions.length}</div>
						<div>Audio: {sequenceState.audioEnabled ? "ON" : "OFF"}</div>
						<div>FPS: {sequenceState.performanceMetrics.frameRate}</div>
					</div>
				)}
			</div>
		</InteractionProvider>
	);
};
