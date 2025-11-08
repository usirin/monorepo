import classNames from "classnames";
import * as React from "react";
import {type AriaButtonProps, useButton} from "react-aria";

import styles from "./Button.module.css";
import type {Color} from "./phoenix";

export interface ButtonProps extends AriaButtonProps {
	ref?: React.RefObject<HTMLButtonElement>;
	className?: string;
	color?: Color;
}

export function Button({className, color = "gray", ...props}: ButtonProps) {
	const internalRef = React.useRef<HTMLButtonElement | null>(null);
	const ref = props.ref ?? internalRef;
	const {buttonProps} = useButton(props, ref);

	return (
		<button {...buttonProps} data-color={color} className={classNames(styles.button, className)}>
			{props.children}
		</button>
	);
}
