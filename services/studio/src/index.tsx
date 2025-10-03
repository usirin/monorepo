import React from "react";
import ReactDOM from "react-dom/client";
import LetsGo from "./App";
import {Stack} from "./phoenix/Stack";

const Menubar = () => <Stack>menubar</Stack>;
const Statusbar = () => <Stack>statusbar</Stack>;
const Leftbar = () => <Stack>Leftbar</Stack>;
const Rightbar = () => <Stack>Rightbar</Stack>;

async function kickthefuckoff() {
	const rootEl = document.getElementById("root");

	if (rootEl) {
		const root = ReactDOM.createRoot(rootEl);
		root.render(
			<React.StrictMode>
				<Stack>
					<Menubar />
					<Stack direction="horizontal">
						<Leftbar />
						<LetsGo />
						<Rightbar />
					</Stack>
					<Statusbar />
				</Stack>
			</React.StrictMode>,
		);
	}
}

kickthefuckoff()
	.then(console.log.bind(console.log, "we fuckin did it"))
	.catch(console.error.bind(console.error, "houston we have a problem"));
