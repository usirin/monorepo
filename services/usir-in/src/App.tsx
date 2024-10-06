import {KeystrokesManager} from "./KeystrokesManager";
import {Workspace} from "./widget-manager/Workspace";
import "./widget-manager/styles.css";

import "@radix-ui/themes/styles.css";

function Layout(props: {children: React.ReactNode}) {
	return (
		<html lang="en">
			<head>
				<title>u5</title>
			</head>
			<body>{props.children}</body>
		</html>
	);
}

const App = (props: {name: string}) => {
	return (
		<Layout>
			<KeystrokesManager>
				<Workspace />
			</KeystrokesManager>
		</Layout>
	);
};

export default App;
