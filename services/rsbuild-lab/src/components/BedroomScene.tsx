import {Canvas} from "@react-three/fiber";
import type React from "react";
import {Suspense} from "react";
import {SequencePhase} from "../models/SequenceState.js";

interface BedroomSceneProps {
	readonly phase: SequencePhase;
}

export const BedroomScene: React.FC<BedroomSceneProps> = ({phase}) => {
	return (
		<Canvas
			camera={{
				position: [0, 1.6, 2],
				fov: 50,
			}}
			style={{
				width: "100%",
				height: "100%",
				filter: phase === SequencePhase.AWAKENING ? "blur(5px)" : "none",
				transition: "filter 1s ease-out",
			}}
		>
			{/* Basic lighting setup */}
			<ambientLight intensity={0.4} />
			<directionalLight position={[5, 8, 2]} intensity={0.8} castShadow />

			{/* Scene content */}
			<Suspense fallback={<LoadingGeometry />}>
				<BedroomCorner phase={phase} />
			</Suspense>
		</Canvas>
	);
};

// Simple loading geometry while assets load
const LoadingGeometry: React.FC = () => (
	<mesh>
		<boxGeometry args={[1, 1, 1]} />
		<meshStandardMaterial color="#444" />
	</mesh>
);

// Basic bedroom corner setup
const BedroomCorner: React.FC<{phase: SequencePhase}> = ({phase}) => {
	return (
		<group>
			{/* Floor */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
				<planeGeometry args={[10, 10]} />
				<meshStandardMaterial color="#8B7355" />
			</mesh>

			{/* Wall */}
			<mesh position={[0, 2.5, -3]}>
				<planeGeometry args={[10, 5]} />
				<meshStandardMaterial color="#F5F5DC" />
			</mesh>

			{/* Nightstand placeholder */}
			<mesh position={[1.5, 0.4, 0]}>
				<boxGeometry args={[0.8, 0.8, 0.4]} />
				<meshStandardMaterial color="#8B4513" />
			</mesh>

			{/* Glasses placeholder */}
			<mesh position={[1.3, 0.85, 0.1]}>
				<torusGeometry args={[0.05, 0.01, 8, 16]} />
				<meshStandardMaterial
					color="#333"
					transparent
					opacity={phase === SequencePhase.AWAKENING ? 0.3 : 1}
				/>
			</mesh>

			{/* Phone placeholder */}
			<mesh position={[1.7, 0.82, 0]}>
				<boxGeometry args={[0.08, 0.15, 0.01]} />
				<meshStandardMaterial color="#000" />
			</mesh>
		</group>
	);
};
