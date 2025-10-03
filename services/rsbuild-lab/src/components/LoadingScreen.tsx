import type React from "react";

interface LoadingScreenProps {
	readonly progress: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({progress}) => {
	const progressPercentage = Math.round(progress * 100);

	return (
		<div
			style={{
				width: "100vw",
				height: "100vh",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				background: "linear-gradient(to bottom, #1a1a2e, #16213e)",
				color: "#ffffff",
				fontFamily: "system-ui, -apple-system, sans-serif",
			}}
		>
			{/* Loading message */}
			<div
				style={{
					fontSize: "24px",
					marginBottom: "30px",
					opacity: 0.9,
					textAlign: "center",
				}}
			>
				Loading consciousness...
			</div>

			{/* Progress bar */}
			<div
				style={{
					width: "300px",
					height: "4px",
					background: "rgba(255, 255, 255, 0.1)",
					borderRadius: "2px",
					overflow: "hidden",
					marginBottom: "20px",
				}}
			>
				<div
					style={{
						width: `${progressPercentage}%`,
						height: "100%",
						background: "linear-gradient(90deg, #4facfe, #00f2fe)",
						borderRadius: "2px",
						transition: "width 0.3s ease-out",
					}}
				/>
			</div>

			{/* Progress percentage */}
			<div
				style={{
					fontSize: "14px",
					opacity: 0.7,
					marginBottom: "40px",
				}}
			>
				{progressPercentage}%
			</div>

			{/* Subtle hint */}
			<div
				style={{
					fontSize: "12px",
					opacity: 0.5,
					textAlign: "center",
					maxWidth: "400px",
					lineHeight: "1.4",
				}}
			>
				Preparing Umut's morning experience...
				<br />
				<em>This is his authentic story.</em>
			</div>
		</div>
	);
};
