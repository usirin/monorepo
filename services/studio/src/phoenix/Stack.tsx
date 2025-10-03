import classNames from "classnames";
import * as React from "react";
import type {Object as Obj} from "ts-toolbelt";
import type {Space} from "./phoenix";
import {capitalize} from "effect/String";
import * as Slot from "@radix-ui/react-slot";

import styles from "./Stack.module.css";

// using Object.AtLeast from `ts-toolbelt` to ensure that at least one of the
// properties is present this is to prevent the case where an empty object is
// passed as padding
type DirectionalPadding = Obj.AtLeast<
	{
		top: Space;
		right: Space;
		bottom: Space;
		left: Space;
	},
	"top" | "right" | "bottom" | "left"
>;

type Padding = Space | DirectionalPadding;

export interface StackProps extends React.HTMLAttributes<HTMLElement> {
	/**
	 * The component or HTML element to render as the root element.
	 * @default 'div'
	 * @deprecated use `asChild`
	 */
	as?: React.ElementType;

	/**
	 * Decides if stack should be rendered as its immediate child.
	 * @default false
	 */
	asChild?: boolean;

	/**
	 * The direction of flow for elements in the Stack.
	 * @default 'vertical'
	 */
	direction?: "vertical" | "horizontal" | "vertical-reverse" | "horizontal-reverse";

	/**
	 * How to align elements in the Stack, perpendicular to the current `direction`.
	 * @default 'stretch'
	 */
	align?: "start" | "center" | "end" | "stretch" | "baseline";

	/**
	 * How to align elements in the Stack, inline with the current `direction`.
	 * @default 'start'
	 */
	justify?: "start" | "center" | "end" | "space-between" | "space-around";

	/**
	 * Should the elements wrap to the next line if they don't fit in the current line?
	 * @default false
	 */
	wrap?: boolean;

	/**
	 * How much space to render between elements of the Stack.
	 * @default 8
	 */
	gap?: Space;

	/**
	 * Padding to apply to the Stack container.
	 * Can be a number for uniform padding, or an object for directional padding.
	 * @default 0
	 */
	padding?: Padding;
	/**
	 * Whether to set the width of the Stack to 100% of its container.
	 * @default true
	 */
	fullWidth?: boolean;
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(function Stack(
	{
		asChild = false,
		gap = 8,
		direction = "vertical",
		align = "stretch",
		justify = "start",
		wrap = false,
		padding = 0,
		fullWidth = true,
		style,
		className,
		children,
		...rest
	}: StackProps,
	ref,
) {
	const Component = asChild ? Slot.Root : "div";

	return (
		<Component
			ref={ref}
			data-align={align}
			data-justify={justify}
			data-direction={direction}
			data-wrap={wrap}
			data-full-width={fullWidth}
			className={classNames(styles.stack, className)}
			style={{
				...style,
				gap: getSpace(gap),
				...getPadding(padding),
			}}
			{...rest}
		>
			{children}
		</Component>
	);
});

const getSpace = (value: Space) => `var(--space-${value})`;

type DirectionalKey = keyof DirectionalPadding;
type PaddingKey = `padding${Capitalize<DirectionalKey>}`;

const getPadding = (padding: Padding) => {
	if (typeof padding === "number" || typeof padding === "string") {
		return {padding: getSpace(padding)};
	}

	return Object.entries(padding).reduce<React.CSSProperties>((styles, [key, value]) => {
		const paddingKey = `padding${capitalize(key as DirectionalKey)}` as PaddingKey;
		styles[paddingKey] = getSpace(value);
		return styles;
	}, {});
};
