import {JSDOM} from "jsdom";

// Cache original global values
const originalGlobals = {
	window: global.window,
	document: global.document,
	KeyboardEvent: global.KeyboardEvent,
} as const;

export class MockKeyboardEvent {
	key: string;
	type: string;
	ctrlKey: boolean;
	code: string;
	which?: number;
	altKey: boolean;
	shiftKey: boolean;
	metaKey: boolean;
	repeat: boolean;
	isComposing: boolean;
	location: number;
	charCode: number;
	keyCode: number;

	constructor(
		type: string,
		init: {
			key: string;
			ctrlKey?: boolean;
			code?: string;
			which?: number;
			altKey?: boolean;
			shiftKey?: boolean;
			metaKey?: boolean;
			repeat?: boolean;
			isComposing?: boolean;
			location?: number;
			charCode?: number;
			keyCode?: number;
		},
	) {
		this.type = type;
		this.key = init.key;
		this.ctrlKey = init.ctrlKey || false;
		this.code = init.code || "";
		this.which = init.which;
		this.altKey = init.altKey || false;
		this.shiftKey = init.shiftKey || false;
		this.metaKey = init.metaKey || false;
		this.repeat = init.repeat || false;
		this.isComposing = init.isComposing || false;
		this.location = init.location || 0;
		this.charCode = init.charCode || 0;
		this.keyCode = init.keyCode || 0;
	}
}

export function setupTestEnv() {
	const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
	global.KeyboardEvent = MockKeyboardEvent as unknown as typeof KeyboardEvent;
	global.window = dom.window as unknown as typeof window;
	global.document = dom.window.document;
}

export function teardownTestEnv() {
	// Restore original values
	global.window = originalGlobals.window;
	global.document = originalGlobals.document;
	global.KeyboardEvent = originalGlobals.KeyboardEvent;
}
