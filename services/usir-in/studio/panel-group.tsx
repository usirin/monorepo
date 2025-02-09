"use client";

import clsx from "clsx";
import {type PanelGroupProps, PanelGroup as ResizablePanelGroup} from "react-resizable-panels";
import styles from "./workspace.module.css";

export function PanelGroup({className, ...props}: PanelGroupProps) {
	return <ResizablePanelGroup {...props} className={clsx(styles.PanelGroup, className)} />;
}
