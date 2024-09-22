export interface Container<Tag extends string> {
	tag: Tag;
}

interface HorizontalSplit extends Container<"split_h"> {}

interface VerticalSplit extends Container<"split_v"> {}
