import {Layer, ManagedRuntime} from "effect";
import {AnalyticsService} from "../services/AnalyticsService.js";
import {AssetService} from "../services/AssetService.js";
import {AudioService} from "../services/AudioService.js";
import {InteractionService} from "../services/InteractionService.js";
import {SequenceService} from "../services/SequenceService.js";

// Create a single shared service layer with all dependencies
// This ensures all components use the same service instances
const SharedServiceLayer = Layer.mergeAll(
	SequenceService.Default,
	AssetService.Default,
	AnalyticsService.Default,
	AudioService.Default,
	InteractionService.Default,
);

// Create a single managed runtime with all services
export const AppRuntime = ManagedRuntime.make(SharedServiceLayer);
