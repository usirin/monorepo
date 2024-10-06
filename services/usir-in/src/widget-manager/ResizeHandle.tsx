import {PanelResizeHandle} from "react-resizable-panels";

import clsx from "clsx";
import styles from "./wm.module.css";

export default function ResizeHandle({
	className,
	id,
}: {
	className?: string;
	id?: string;
}) {
	return (
		<PanelResizeHandle className={clsx(styles.ResizeHandleOuter, className)} id={id}>
			<div className={styles.ResizeHandleInner} />
		</PanelResizeHandle>
	);
}
