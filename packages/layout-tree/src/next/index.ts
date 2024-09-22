type Tagged<Tag extends string, Data> = {tag: Tag; id: string; data: Data};

const generateId = () => Math.random().toString(36).substring(0, 6);

type Container =
	| Tagged<"split_v", {children: Container[]}>
	| Tagged<"split_h", {children: Container[]}>
	| Tagged<"window", unknown>;

const VerticalSplit = (children: Container[]): Container => ({
	tag: "split_v",
	id: `split_v:${generateId()}`,
	data: {children},
});

const HorizontalSplit = (children: Container[]): Container => ({
	tag: "split_h",
	id: `split_h:${generateId()}`,
	data: {children},
});

const Window = <T>(data: T): Container => ({
	tag: "window",
	id: `window:${generateId()}`,
	data,
});

class LayoutTree {
	root: Container;
	focused: Container | null;

	constructor(root: Container) {
		this.root = root;
		this.focused = root;
	}
}

const window = Window(1);

const tree = new LayoutTree(HorizontalSplit([Window({})]));
