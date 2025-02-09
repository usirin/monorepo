"use client";

import {PanelResizeHandle} from "react-resizable-panels";
import styles from "./workspace.module.css";

export function ResizeHandle({id}: {id: string}) {
	return (
		<PanelResizeHandle id={id} className={styles.ResizeHandleOuter}>
			<div className={styles.ResizeHandleInner} />
		</PanelResizeHandle>
	);
}
