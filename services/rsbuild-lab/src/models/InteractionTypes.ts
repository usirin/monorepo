export {InteractionEvent, InteractionType, SequencePhase} from "./SequenceState.js";

export interface MouseInteractionEvent {
	readonly type: "mouse_move" | "mouse_click";
	readonly clientX: number;
	readonly clientY: number;
	readonly target?: string;
}

export interface KeyboardInteractionEvent {
	readonly type: "key_press";
	readonly key: string;
	readonly ctrlKey: boolean;
	readonly shiftKey: boolean;
	readonly altKey: boolean;
}

export interface TouchInteractionEvent {
	readonly type: "touch_start" | "touch_end" | "touch_move";
	readonly touches: ReadonlyArray<{
		readonly clientX: number;
		readonly clientY: number;
		readonly identifier: number;
	}>;
}

export type UserInteractionEvent =
	| MouseInteractionEvent
	| KeyboardInteractionEvent
	| TouchInteractionEvent;

export interface InteractionResult {
	readonly success: boolean;
	readonly nextPhase?: SequencePhase;
	readonly message?: string;
}
