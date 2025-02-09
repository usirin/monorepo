import {useDroppable} from "@dnd-kit/core";
import type {StackPath} from "@umut/layout-tree";
import clsx from "clsx";
import styles from "./workspace.module.css";

export function DropHandle({id, path, after}: {id: string; path: StackPath; after?: true}) {
	const {isOver, setNodeRef, active} = useDroppable({id, data: {path, after}});

	if (!active) return null;
	if (active.data.current?.path.join(":") === path.join(":")) return null;

	return (
		<div ref={setNodeRef} className={clsx(styles.DropHandleOuter, isOver && styles.IsOver)}>
			<div className={styles.DropHandleInner} />
		</div>
	);
}
