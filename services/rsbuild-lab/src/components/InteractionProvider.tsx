import type React from "react";
import {createContext, type ReactNode, useContext, useEffect} from "react";
import {useInteractions} from "../hooks/useInteractions.js";

interface InteractionContextValue {
	readonly handleMouseMove: (event: MouseEvent) => void;
	readonly handleClick: () => void;
}

const InteractionContext = createContext<InteractionContextValue | null>(null);

export const useInteractionContext = () => {
	const context = useContext(InteractionContext);
	if (!context) {
		throw new Error("useInteractionContext must be used within InteractionProvider");
	}
	return context;
};

interface InteractionProviderProps {
	readonly children: ReactNode;
}

export const InteractionProvider: React.FC<InteractionProviderProps> = ({children}) => {
	const interactions = useInteractions();

	useEffect(() => {
		// Add global mouse move listener
		const handleMouseMove = (event: MouseEvent) => {
			interactions.handleMouseMove(event);
		};

		// Add global click listener
		const handleClick = () => {
			interactions.handleClick();
		};

		// Add global keyboard listener for accessibility
		const handleKeyDown = (event: KeyboardEvent) => {
			switch (event.key) {
				case "Enter":
				case " ":
					event.preventDefault();
					interactions.handleClick();
					break;
				case "Escape":
					// Could add skip functionality here
					console.log("Escape pressed - skip option");
					break;
			}
		};

		// Attach event listeners
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("click", handleClick);
		document.addEventListener("keydown", handleKeyDown);

		// Cleanup event listeners
		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("click", handleClick);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [interactions]);

	const contextValue: InteractionContextValue = {
		handleMouseMove: interactions.handleMouseMove,
		handleClick: interactions.handleClick,
	};

	return <InteractionContext.Provider value={contextValue}>{children}</InteractionContext.Provider>;
};
