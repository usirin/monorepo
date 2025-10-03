import type React from "react";
import {WakeUpSequence} from "./components/WakeUpSequence.js";
import {AppRuntime} from "./runtime/AppRuntime.js";
import {RuntimeProvider} from "./runtime/RuntimeProvider.js";
import "./App.css";

const App: React.FC = () => {
	return (
		<RuntimeProvider runtime={AppRuntime}>
			<WakeUpSequence />
		</RuntimeProvider>
	);
};

export default App;
