"use client";

import {Background, Controls, Handle, Position, ReactFlow} from "@xyflow/react";
import "@xyflow/react/dist/base.css";
import {create} from "zustand";
import {useShallow} from "zustand/react/shallow";

import {Card} from "@radix-ui/themes";
import type {
	BuiltInNode,
	Edge,
	Node,
	NodeProps,
	OnConnect,
	OnEdgesChange,
	OnNodesChange,
	Viewport,
} from "@xyflow/react";
import {addEdge, applyEdgeChanges, applyNodeChanges} from "@xyflow/react";
import {persist} from "zustand/middleware";

type CountNode = Node<{count: number; label: string}, "base">;

export type AppNode = BuiltInNode | CountNode;

export type AppState = {
	nodes: AppNode[];
	edges: Edge[];
	viewport: Viewport;
	actions: {
		onNodesChange: OnNodesChange<AppNode>;
		onEdgesChange: OnEdgesChange;
		onViewportChange: (viewport: Viewport) => void;
		onConnect: OnConnect;
		setNodes: (nodes: AppNode[]) => void;
		setEdges: (edges: Edge[]) => void;
	};
};

function BaseNode({data, isConnectable}: NodeProps<CountNode>) {
	return (
		<div>
			<Card>
				{data.label}
				<br />
				{data.count}
			</Card>
			<Handle type="target" position={Position.Top} id="a" isConnectable={isConnectable} />
			<Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
			<Handle
				type="source"
				position={Position.Bottom}
				id="c"
				style={{left: 10}}
				isConnectable={isConnectable}
			/>
		</div>
	);
}

const initialNodes = [
	{
		id: "1",
		type: "input",
		data: {label: "Input"},
		position: {x: 250, y: 25},
	},

	{
		id: "2",
		type: "base",
		data: {label: "Default", count: 0},
		position: {x: 100, y: 125},
	},
	{
		id: "3",
		type: "output",
		data: {label: "Output"},
		position: {x: 250, y: 250},
	},
] as AppNode[];

const initialEdges = [] as Edge[];
const initialViewport = {zoom: 1, x: 0, y: 0};

const useStoreInternal = create<AppState>()(
	persist(
		(set, get) => ({
			nodes: initialNodes,
			edges: initialEdges,
			viewport: initialViewport,
			actions: {
				onNodesChange: (changes) => set({nodes: applyNodeChanges(changes, get().nodes)}),
				onEdgesChange: (changes) => set({edges: applyEdgeChanges(changes, get().edges)}),
				onViewportChange: (viewport) => {
					console.log("viewport", viewport);
					return set({viewport});
				},
				onConnect: (connection) => set({edges: addEdge(connection, get().edges)}),
				setNodes: (nodes) => set({nodes}),
				setEdges: (edges) => set({edges}),
			},
		}),
		{
			name: "flow-manager",
		},
	),
);

const selector = (state: AppState) => ({
	nodes: state.nodes,
	edges: state.edges,
	viewport: state.viewport,
	actions: state.actions,
});

export const useStore = () => {
	return useStoreInternal(useShallow(selector));
};

const nodeTypes = {base: BaseNode};
const panOnDrag = [1, 2];

export function FlowManager() {
	const {
		nodes,
		edges,
		viewport,
		actions: {onNodesChange, onEdgesChange, onConnect, onViewportChange},
	} = useStore();

	return (
		<ReactFlow
			colorMode="dark"
			nodes={nodes}
			edges={edges}
			defaultViewport={viewport}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			onConnect={onConnect}
			onViewportChange={onViewportChange}
			nodeTypes={nodeTypes}
			panOnScroll
			selectionOnDrag
			panOnDrag={panOnDrag}
		>
			<Background />
			<Controls />
		</ReactFlow>
	);
}
