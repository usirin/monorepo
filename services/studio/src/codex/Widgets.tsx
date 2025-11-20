interface Widget {
	name: string;
	render: () => React.ReactNode;

	menubar?: () => React.ReactNode;
	leftbar?: () => React.ReactNode;
	rightbar?: () => React.ReactNode;
	statusbar?: () => React.ReactNode;
}

export const Home: Widget = {
	name: "home",
	render: () => <div>Welcome to the Home Widget!</div>,
	leftbar: () => <div>Home Leftbar Content</div>,
};

export const About: Widget = {
	name: "about",
	render: () => <div>Welcome to the About Widget!</div>,
	leftbar: () => <div>About Leftbar Content</div>,
	menubar: () => (
		<li>
			<a href="/home">Abuout menu</a>
		</li>
	),
};

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState } from "react";
import { useVoxelGenerator } from "../hooks/useVoxelGenerator";
import { VoxelRenderer } from "../components/VoxelRenderer";
import { Generators } from "../services/VoxelService";

const VoxelCanvasView = () => {
	const { voxels } = useVoxelGenerator();

	return (
		<div style={{ width: "1000px", height: "1000px", position: "relative", overflow: "hidden" }}>
			<Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
				<ambientLight intensity={0.5} />
				<pointLight position={[10, 10, 10]} />
				<VoxelRenderer voxels={voxels} />
				<OrbitControls />
				<gridHelper args={[20, 20]} />
			</Canvas>
		</div>
	);
};

const VoxelControls = () => {
	const { generate, generateFromPrompt, currentModel, isGenerating } = useVoxelGenerator();
	const [prompt, setPrompt] = useState("");

	return (
		<div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "15px", height: "100%" }}>
			<h3 style={{ color: "white", margin: "0 0 10px 0" }}>Voxel Controls</h3>
			
			<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
				<label style={{ color: "#aaa", fontSize: "0.9em" }}>Presets</label>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
					{Object.keys(Generators).map((model) => (
						<button
							key={model}
							onClick={() => generate(model as keyof typeof Generators)}
							disabled={isGenerating}
							style={{
								padding: "8px",
								background: currentModel === model ? "#666" : "#444",
								color: "white",
								border: "none",
								cursor: "pointer",
								opacity: isGenerating ? 0.5 : 1,
								borderRadius: "4px",
								textAlign: "center"
							}}
						>
							{model}
						</button>
					))}
				</div>
			</div>

			<div style={{ height: "1px", background: "#555", margin: "5px 0" }} />

			<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
				<label style={{ color: "#aaa", fontSize: "0.9em" }}>AI Generation</label>
				<textarea 
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					placeholder="Describe a voxel model..."
					rows={4}
					style={{
						padding: "8px",
						background: "#222",
						border: "1px solid #444",
						color: "white",
						borderRadius: "4px",
						resize: "vertical",
						minHeight: "80px"
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey && prompt && !isGenerating) {
							e.preventDefault();
							generateFromPrompt(prompt);
						}
					}}
				/>
				<button
					onClick={() => prompt && generateFromPrompt(prompt)}
					disabled={isGenerating || !prompt}
					style={{
						padding: "10px",
						background: isGenerating ? "#444" : "#2f74c0",
						color: "white",
						border: "none",
						cursor: isGenerating || !prompt ? "default" : "pointer",
						borderRadius: "4px",
						opacity: isGenerating || !prompt ? 0.5 : 1,
						fontWeight: "bold"
					}}
				>
					{isGenerating ? "Generating..." : "Generate"}
				</button>
			</div>
		</div>
	);
};

export const Voxel: Widget = {
	name: "voxel-canvas",
	render: () => <VoxelCanvasView />,
	leftbar: () => null,
	menubar: () => (
		<li>
			<a href="/voxel">Voxel</a>
		</li>
	),
	rightbar: () => <VoxelControls />
};