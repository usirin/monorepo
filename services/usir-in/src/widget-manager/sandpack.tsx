import {
	SandpackCodeEditor,
	SandpackLayout,
	SandpackPreview,
	SandpackProvider,
} from "@codesandbox/sandpack-react";

export const Sandpack = () => (
	<SandpackProvider template="react" theme="auto" style={{height: "100%"}}>
		<SandpackLayout style={{height: "100%"}}>
			<SandpackCodeEditor showLineNumbers showRunButton style={{height: "100%"}} />
			<SandpackPreview style={{height: "100%"}} />
		</SandpackLayout>
	</SandpackProvider>
);
