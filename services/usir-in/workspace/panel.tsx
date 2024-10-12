"use client";

import clsx from "clsx";
import {type PanelProps, Panel as ResizablePanel} from "react-resizable-panels";
import styles from "./workspace.module.css";

export function Panel({children, ...props}: Omit<PanelProps, "id"> & {id: string}) {
	return (
		<ResizablePanel {...props} className={clsx(styles.Panel, props.className)}>
			{children}
		</ResizablePanel>
	);
}
