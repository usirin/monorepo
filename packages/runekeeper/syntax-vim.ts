const has = <T extends object, K extends keyof T>(
	obj: T,
	key: string | number | symbol,
): key is K => Object.hasOwn(obj, key);

const aliases = {
	left: "ArrowLeft",
	right: "ArrowRight",
	up: "ArrowUp",
	down: "ArrowDown",
	bs: "Backspace",
	menu: "ContextMenu",
	apps: "ContextMenu",
	del: "Delete",
	return: "Enter",
	cr: "Enter",
	esc: "Escape",
	pgup: "PageUp",
	pgdn: "PageDown",
	lt: "<",
	less: "<",
	lesser: "<",
	gt: ">",
	greater: ">",
};

const alias = (key: string) => {
	const keyLower = key.toLowerCase();
	return has(aliases, keyLower) ? aliases[keyLower] : key;
};

const enUsTranslations = {
	Backquote: ["`", "~"],
	Digit1: ["1", "!"],
	Digit2: ["2", "@"],
	Digit3: ["3", "#"],
	Digit4: ["4", "$"],
	Digit5: ["5", "%"],
	Digit6: ["6", "^"],
	Digit7: ["7", "&"],
	Digit8: ["8", "*"],
	Digit9: ["9", "("],
	Digit0: ["0", ")"],
	Minus: ["-", "_"],
	Equal: ["=", "+"],
	Backslash: ["\\", "|"],
	BracketLeft: ["[", "{"],
	BracketRight: ["]", "}"],
	Semicolon: [";", ":"],
	Quote: ["'", '"'],
	Comma: [",", "<"],
	Period: [".", ">"],
	Slash: ["/", "?"],
};

const codeToEnUsQwerty = (code: string, shift?: boolean) => {
	if (code.startsWith("Key")) {
		let key = code.slice(3);
		if (!shift) key = key.toLowerCase();
		return key;
	}

	return has(enUsTranslations, code) ? enUsTranslations[code][shift ? 1 : 0] : code;
};

/** Represents an error that occurs when an invalid key is encountered. */
export interface InvalidKeyError {
	name: "InvalidKeyError";
	key: string;
	message: `Invalid key: ${string}`;
}
/** Represents an error that occurs when an unknown modifier is encountered. */
export interface UnknownModifierError {
	name: "UnknownModifierError";
	modifier: string;
	context: string;
	message: `${string}: Unknown modifier: ${string}`;
}
/** Represents an error that occurs when a duplicate modifier is encountered. */
export interface DuplicateModifierError {
	name: "DuplicateModifierError";
	modifier: string;
	context: string;
	message: `${string}: Duplicate modifier: ${string}`;
}
/** Represents an error that occurs when a disallowed modifier is used with single-character keys. */
export interface DisallowedModifierError {
	name: "DisallowedModifierError";
	modifier: string;
	context: string;
	message: `${string}: Unusable modifier with single-character keys: ${string}`;
}

/**
 * Represents a key with optional modifiers.
 *
 * This is a superset of the Web API's [`KeyboardEvent`](https://developer.mozilla.org/docs/Web/API/KeyboardEvent).
 */
export interface Key {
	/** the same as [`KeyboardEvent.key`](https://developer.mozilla.org/docs/Web/API/KeyboardEvent/key) */
	key: string;

	/**  the same as [`KeyboardEvent.code`](https://developer.mozilla.org/docs/Web/API/KeyboardEvent/code) */
	code?: string;

	/**  the same as [`KeyboardEvent.shiftKey`](https://developer.mozilla.org/docs/Web/API/KeyboardEvent/shiftKey) */
	shiftKey?: boolean;

	/**  the same as [`KeyboardEvent.ctrlKey`](https://developer.mozilla.org/docs/Web/API/KeyboardEvent/ctrlKey) */
	ctrlKey?: boolean;

	/**  the same as [`KeyboardEvent.altKey`](https://developer.mozilla.org/docs/Web/API/KeyboardEvent/altKey) */
	altKey?: boolean;

	/**  the same as [`KeyboardEvent.metaKey`](https://developer.mozilla.org/docs/Web/API/KeyboardEvent/metaKey) */
	metaKey?: boolean;
}

const specialCases = {
	"<": "lt",
	">": "gt",
};

const ignored = /^($|Unidentified$|Process$|Dead$|Alt|Control|Hyper|Meta|Shift|Super|OS)/;

/**
 * Converts a Key event into a string representation.
 *
 * @param event - The Key event to stringify.
 * @returns The string representation of the Key event.
 */
export const stringify = (event: Key): string => {
	let shift = event.shiftKey;
	let key = event.key || "Unidentified";
	if (key === "Unidentified") {
		key = codeToEnUsQwerty(event.code || "", shift);
	} else {
		key = alias(key);
		if (key === " ") key = "Space";
	}

	if (ignored.test(key)) return "";

	if (key.length === 1) {
		shift = false;
	} else {
		key = key.toLowerCase();
	}

	let modifiers = "";
	if (event.altKey) modifiers += "a-";
	if (event.ctrlKey) modifiers += "c-";
	if (event.metaKey) modifiers += "m-";
	if (shift) modifiers += "s-";

	if (has(specialCases, key)) key = specialCases[key];

	return modifiers || key.length > 1 ? `<${modifiers}${key}>` : key;
};

/**
 * Represents a result that can either be successful (`ok` is `true`) with a value of type `T`,
 * or a failure (`ok` is `false`) with a value of type `E`.
 */
export type Result<T, E> = {ok: true; value: T} | {ok: false; value: E};

const modifierMap = {
	a: "altKey",
	c: "ctrlKey",
	m: "metaKey",
	s: "shiftKey",
} as const;

/**
 * Parses a key string and returns a Result object containing the parsed key or an error.
 *
 * @param keyString - The key string to parse.
 * @returns A Result object containing the parsed key or an error.
 */
export const parse = (
	keyString: string,
): Result<
	Key,
	InvalidKeyError | UnknownModifierError | DuplicateModifierError | DisallowedModifierError
> => {
	if (keyString.length === 1) {
		if (/\s/.test(keyString)) {
			return {
				ok: false,
				value: {
					name: "InvalidKeyError",
					key: keyString,
					message: `Invalid key: ${keyString}`,
				},
			};
		}
		return {ok: true, value: {key: keyString}};
	}

	const match = keyString.match(/^<((?:[a-z]-)*)([a-z\d]+|[^<>\s])>$/i);
	if (!match) {
		return {
			ok: false,
			value: {
				name: "InvalidKeyError",
				key: keyString,
				message: `Invalid key: ${keyString}`,
			},
		};
	}
	const [, modifiers, key] = match;

	const obj: Key = {
		key: alias(key),
	};

	for (const modifier of modifiers.split("-").slice(0, -1)) {
		const modifierLower = modifier.toLowerCase();
		if (!has(modifierMap, modifierLower)) {
			return {
				ok: false,
				value: {
					name: "UnknownModifierError",
					modifier,
					context: keyString,
					message: `${keyString}: Unknown modifier: ${modifier}`,
				},
			};
		}
		const modifierName = modifierMap[modifierLower];

		if (obj[modifierName] !== undefined) {
			return {
				ok: false,
				value: {
					name: "DuplicateModifierError",
					modifier,
					context: keyString,
					message: `${keyString}: Duplicate modifier: ${modifier}`,
				},
			};
		}

		obj[modifierName] = true;

		if (obj.key.length === 1 && obj.shiftKey) {
			return {
				ok: false,
				value: {
					name: "DisallowedModifierError",
					modifier,
					context: keyString,
					message: `${keyString}: Unusable modifier with single-character keys: ${modifier}`,
				},
			};
		}
	}

	return {ok: true, value: obj};
};

/**
 * Normalizes a key string by parsing and stringifying it.
 *
 * @param keyString - The key string to normalize.
 * @returns A Result object containing the normalized key string or an error.
 */
export const normalize = (
	keyString: string,
): Result<
	string,
	InvalidKeyError | UnknownModifierError | DuplicateModifierError | DisallowedModifierError
> => {
	const result = parse(keyString);
	return result.ok ? {ok: true, value: stringify(result.value)} : result;
};

/**
 * Parses a key sequence and returns an array of strings.
 *
 * @param sequence The key sequence to parse.
 * @returns An array of strings representing the parsed key sequence.
 */
export const parseSequence = (keySequence: string): string[] | null =>
	keySequence.match(/<[^<>\s]+>|[\s\S]|^$/g);
