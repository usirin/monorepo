import {type Entity, factory} from "./entity";

export type Orientation = "horizontal" | "vertical";
export type Direction = "left" | "right" | "up" | "down";

export interface Window extends Entity<"window"> {
	key: string;
}

export interface Stack extends Entity<"stack"> {
	orientation: Orientation;
	children: Array<Window["id"] | Stack["id"]>;
}

const createStack = factory("stack", (orientation: Orientation, children: (Window | Stack)[]) => ({
	orientation,
	children: children.map((child) => child.id),
}));

const createWindow = factory("window", (key: string) => ({
	key,
}));

export function createTree() {
	const cache = new Map<string, Stack | Window>();

	const root = createStack("vertical", [createWindow("scratch")]);
}
