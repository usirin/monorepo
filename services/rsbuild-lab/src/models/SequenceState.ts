export enum SequencePhase {
	LOADING = "loading",
	AWAKENING = "awakening", // 0-20s: Passive blur
	REACHING = "reaching", // 20-45s: Mouse-guided reach
	CLARITY = "clarity", // 45-70s: Click activation
	AWARENESS = "awareness", // 70-90s: Choice awareness
}

export interface PerformanceData {
	readonly frameRate: number;
	readonly loadTime: number;
	readonly memoryUsage: number;
}

export interface InteractionEvent {
	readonly type: InteractionType;
	readonly phase: SequencePhase;
	readonly timestamp: number;
	readonly metadata?: Record<string, unknown>;
}

export enum InteractionType {
	GLASSES_REACH = "glasses_reach",
	GLASSES_CLICK = "glasses_click",
	CHOICE_HOVER = "choice_hover",
	SEQUENCE_START = "sequence_start",
	SEQUENCE_COMPLETE = "sequence_complete",
}

export interface SequenceState {
	readonly phase: SequencePhase;
	readonly progress: number;
	readonly interactions: ReadonlyArray<InteractionEvent>;
	readonly audioEnabled: boolean;
	readonly performanceMetrics: PerformanceData;
	readonly glassesReached?: boolean;
	readonly ready?: boolean;
}
